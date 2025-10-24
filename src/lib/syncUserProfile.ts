import { supabase } from "@/integrations/supabase/client";

/**
 * Sincroniza el perfil del usuario autenticado con la tabla usuarios.
 * Reconcilia registros antiguos (sin user_id) en el primer login.
 * No borra nada, solo vincula o crea perfil mínimo.
 */
export async function syncUserProfile() {
  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('No authenticated user for sync');
      return null;
    }

    // 2. Intentar cargar perfil por user_id
    const { data: existingProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('id, user_id, nombre, telefono, plan, plan_expires_at, profile_complete')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si encontró el perfil, retornarlo
    if (existingProfile) {
      console.log('Profile found by user_id:', existingProfile.id);
      return existingProfile;
    }

    console.log('No profile found by user_id, attempting reconciliation...');

    // 3. Reconciliar registro antiguo (sin user_id)
    let oldProfileId: string | null = null;

    // 3a. Intentar por email (si está en columna 'nombre')
    if (user.email) {
      const { data: profileByEmail } = await supabase
        .from('usuarios')
        .select('id, user_id')
        .ilike('nombre', user.email)
        .is('user_id', null)
        .limit(1)
        .maybeSingle();

      if (profileByEmail) {
        oldProfileId = profileByEmail.id;
        console.log('Found old profile by email:', oldProfileId);
      }
    }

    // 3b. Intentar por teléfono (si existe en user metadata)
    if (!oldProfileId) {
      const phoneFromMeta = user.user_metadata?.phone || user.phone;
      if (phoneFromMeta) {
        // Normalizar teléfono (solo números)
        const normalizedPhone = phoneFromMeta.replace(/[^0-9]/g, '');
        
        const { data: profileByPhone } = await supabase
          .from('usuarios')
          .select('id, user_id, telefono')
          .is('user_id', null)
          .limit(100);

        // Buscar match en los resultados normalizados
        const match = profileByPhone?.find(p => 
          p.telefono && p.telefono.replace(/[^0-9]/g, '') === normalizedPhone
        );

        if (match) {
          oldProfileId = match.id;
          console.log('Found old profile by phone:', oldProfileId);
        }
      }
    }

    // 4. Si encontró registro antiguo, vincularlo
    if (oldProfileId) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ user_id: user.id })
        .eq('id', oldProfileId);

      if (updateError) {
        console.error('Error updating old profile:', updateError);
      } else {
        console.log('Successfully linked old profile to user_id');
        
        // Retornar el perfil actualizado
        const { data: updatedProfile } = await supabase
          .from('usuarios')
          .select('id, user_id, nombre, telefono, plan, plan_expires_at, profile_complete')
          .eq('id', oldProfileId)
          .single();

        return updatedProfile;
      }
    }

    // 5. Si no existe registro, crear perfil mínimo
    console.log('Creating new minimal profile...');
    
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.nombre || 
                       user.email?.split('@')[0] || 
                       'Usuario';
    
    const phoneFromMeta = user.user_metadata?.phone || user.phone || '';

    const { data: newProfile, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        user_id: user.id,
        nombre: displayName,
        telefono: phoneFromMeta,
        plan: 'free',
        profile_complete: false,
        reporte_mensual: true,
        reporte_semanal: true,
        usage_count: 0,
        usage_month: new Date().toISOString().slice(0, 7)
      })
      .select('id, user_id, nombre, telefono, plan, plan_expires_at, profile_complete')
      .single();

    if (insertError) {
      console.error('Error creating new profile:', insertError);
      return null;
    }

    console.log('Created new profile:', newProfile.id);
    return newProfile;

  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    return null;
  }
}
