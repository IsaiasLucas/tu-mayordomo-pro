import { supabase } from "@/integrations/supabase/client";

/**
 * syncIdentity() - Reconcilia automáticamente profiles y usuarios usando email + auth.uid()
 * Carga exactamente los mismos datos que en netlify, sin pedir teléfono otra vez.
 * No borra nada, solo vincula o crea registros cuando faltan.
 */
export async function syncUserProfile() {
  try {
    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user for sync');
      return null;
    }

    const uid = user.id;
    const email = (user.email || '').toLowerCase();
    const phone = user.phone || user.user_metadata?.phone || null;
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.nombre || 
                       email.split('@')[0] || 
                       'Usuario';

    // 2. PROFILES: buscar por user_id o email
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('*')
      .or(`user_id.eq.${uid},email.eq.${email}`)
      .limit(1)
      .maybeSingle();

    if (!existingProfiles) {
      // Crear nuevo profile
      console.log('Creating new profile...');
      await supabase.from('profiles').insert({
        user_id: uid,
        email: email,
        phone_personal: phone,
        display_name: displayName,
        plan: 'free',
        profile_complete: !!phone,
        whatsapp_configured: !!phone,
        entidad: 'personal'
      });
    } else if (!existingProfiles.user_id || existingProfiles.user_id !== uid) {
      // Vincular profile existente al user_id actual
      console.log('Linking existing profile to user_id...');
      await supabase
        .from('profiles')
        .update({
          user_id: uid,
          phone_personal: phone ?? existingProfiles.phone_personal,
          email: email
        })
        .eq('id', existingProfiles.id);
    }

    // 3. USUARIOS: asegurar que exista fila para este uid
    const { data: existingUsuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle();

    if (!existingUsuario) {
      // Intentar casar por teléfono o email
      let candidato = null;
      
      if (phone) {
        const phoneDigits = phone.replace(/\D/g, '');
        const { data: usuarioByPhone } = await supabase
          .from('usuarios')
          .select('id, user_id')
          .eq('telefono', phoneDigits)
          .is('user_id', null)
          .limit(1)
          .maybeSingle();
        candidato = usuarioByPhone;
      }

      if (!candidato && email) {
        const { data: usuarioByEmail } = await supabase
          .from('usuarios')
          .select('id, user_id')
          .ilike('nombre', email)
          .is('user_id', null)
          .limit(1)
          .maybeSingle();
        candidato = usuarioByEmail;
      }

      if (candidato) {
        // Vincular usuario existente
        console.log('Linking existing usuario to user_id...');
        await supabase
          .from('usuarios')
          .update({ user_id: uid })
          .eq('id', candidato.id);
      } else {
        // Crear nuevo usuario
        console.log('Creating new usuario...');
        const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
        await supabase.from('usuarios').insert({
          user_id: uid,
          nombre: displayName,
          telefono: phoneDigits,
          profile_complete: !!phone,
          plan: 'free',
          reporte_mensual: true,
          reporte_semanal: true,
          usage_count: 0,
          usage_month: new Date().toISOString().slice(0, 7)
        });
      }
    } else if (!existingUsuario.telefono && phone) {
      // Actualizar teléfono si faltaba
      const phoneDigits = phone.replace(/\D/g, '');
      await supabase
        .from('usuarios')
        .update({ 
          telefono: phoneDigits, 
          profile_complete: true 
        })
        .eq('user_id', uid);
    }

    // 4. VINCULAR GASTOS por teléfono
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('phone_personal, phone_empresa')
      .eq('user_id', uid)
      .single();

    if (finalProfile?.phone_personal || finalProfile?.phone_empresa) {
      const phoneToMatch = finalProfile.phone_personal || finalProfile.phone_empresa;
      const normalizedPhone = phoneToMatch.replace(/[^0-9]/g, '');
      
      console.log('Linking old gastos by phone...');
      const { data: gastosToLink } = await supabase
        .from('gastos')
        .select('id, telefono')
        .is('user_id', null)
        .limit(1000);
      
      const gastosIds = gastosToLink
        ?.filter(g => g.telefono && g.telefono.replace(/[^0-9]/g, '') === normalizedPhone)
        .map(g => g.id) || [];
      
      if (gastosIds.length > 0) {
        await supabase
          .from('gastos')
          .update({ user_id: uid })
          .in('id', gastosIds);
        
        console.log(`Linked ${gastosIds.length} gastos to user_id`);
      }
    }

    console.log('✅ Identity sync completed');
    return { success: true };

  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    return null;
  }
}
