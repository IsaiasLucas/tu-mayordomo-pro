import { supabase } from "@/integrations/supabase/client";

/**
 * Sincroniza automáticamente las tablas profiles y usuarios al iniciar sesión.
 * Reconcilia registros antiguos (sin user_id) buscando por email o teléfono.
 * No borra nada, solo vincula o crea registros cuando faltan.
 */
export async function syncUserProfile() {
  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('No authenticated user for sync');
      return null;
    }

    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.nombre || 
                       user.email?.split('@')[0] || 
                       'Usuario';
    
    const phoneFromMeta = user.user_metadata?.phone || user.phone || '';

    // 2. SINCRONIZAR TABLA PROFILES
    let existingProfiles = null;
    
    // Primeiro buscar por user_id
    const { data: profileByUserId } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    existingProfiles = profileByUserId;

    // Se não encontrou por user_id, buscar por email
    if (!existingProfiles && user.email) {
      console.log('No profile found by user_id, searching by email...');
      
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (profileByEmail) {
        console.log('Found profile by email, linking to user_id');
        // Vincular ao user_id
        await supabase
          .from('profiles')
          .update({ user_id: user.id })
          .eq('id', profileByEmail.id);
        
        existingProfiles = profileByEmail;
      }
    }

    if (!existingProfiles) {
      console.log('No profile found, attempting phone reconciliation...');
      
      // Buscar perfil antiguo por email (sem user_id)
      let oldProfile = null;
      if (user.email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .is('user_id', null)
          .maybeSingle();

        oldProfile = profileByEmail;
      }

      // Buscar por teléfono si no encontró por email
      if (!oldProfile && phoneFromMeta) {
        const normalizedPhone = phoneFromMeta.replace(/[^0-9]/g, '');
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .is('user_id', null)
          .limit(100);

        oldProfile = allProfiles?.find(p => 
          (p.phone_personal && p.phone_personal.replace(/[^0-9]/g, '') === normalizedPhone) ||
          (p.phone_empresa && p.phone_empresa.replace(/[^0-9]/g, '') === normalizedPhone)
        );
      }

      // Si encontró perfil antiguo, vincularlo
      if (oldProfile) {
        console.log('Found old profile, linking to user_id:', oldProfile.id);
        await supabase
          .from('profiles')
          .update({ user_id: user.id })
          .eq('id', oldProfile.id);
      } else {
        // Crear nuevo perfil en profiles
        console.log('Creating new profile in profiles table...');
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            display_name: displayName,
            phone_personal: phoneFromMeta,
            plan: 'free',
            profile_complete: false,
            whatsapp_configured: false,
            entidad: 'personal'
          });
      }
    }

    // 3. SINCRONIZAR TABLA USUARIOS
    const { data: existingUsuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingUsuarios) {
      console.log('No usuarios record found by user_id, attempting reconciliation...');
      
      // Buscar registro antiguo por email en nombre
      let oldUsuario = null;
      if (user.email) {
        const { data: usuarioByEmail } = await supabase
          .from('usuarios')
          .select('*')
          .ilike('nombre', user.email)
          .is('user_id', null)
          .maybeSingle();

        oldUsuario = usuarioByEmail;
      }

      // Buscar por teléfono si no encontró por email
      if (!oldUsuario && phoneFromMeta) {
        const normalizedPhone = phoneFromMeta.replace(/[^0-9]/g, '');
        const { data: allUsuarios } = await supabase
          .from('usuarios')
          .select('*')
          .is('user_id', null)
          .limit(100);

        oldUsuario = allUsuarios?.find(u => 
          u.telefono && u.telefono.replace(/[^0-9]/g, '') === normalizedPhone
        );
      }

      // Si encontró registro antiguo, vincularlo
      if (oldUsuario) {
        console.log('Found old usuarios record, linking to user_id:', oldUsuario.id);
        await supabase
          .from('usuarios')
          .update({ user_id: user.id })
          .eq('id', oldUsuario.id);
      } else {
        // Crear nuevo registro en usuarios
        console.log('Creating new record in usuarios table...');
        await supabase
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
          });
      }
    }

    // 4. VINCULAR GASTOS ANTIGOS PELO TELEFONE
    if (existingProfiles?.phone_personal || existingProfiles?.phone_empresa) {
      const phoneToMatch = existingProfiles.phone_personal || existingProfiles.phone_empresa;
      const normalizedPhone = phoneToMatch.replace(/[^0-9]/g, '');
      
      console.log('Linking old gastos by phone...');
      
      // Buscar gastos sem user_id que correspondam ao telefone
      const { data: gastosToLink } = await supabase
        .from('gastos')
        .select('id, telefono')
        .is('user_id', null)
        .limit(1000);
      
      // Filtrar gastos que correspondem ao telefone
      const gastosIds = gastosToLink
        ?.filter(g => g.telefono && g.telefono.replace(/[^0-9]/g, '') === normalizedPhone)
        .map(g => g.id) || [];
      
      if (gastosIds.length > 0) {
        await supabase
          .from('gastos')
          .update({ user_id: user.id })
          .in('id', gastosIds);
        
        console.log(`Linked ${gastosIds.length} gastos to user_id`);
      }
    }

    // 5. Retornar perfil unificado
    const [profileResult, usuarioResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    console.log('Sync completed successfully');
    return {
      profile: profileResult.data,
      usuario: usuarioResult.data
    };

  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    return null;
  }
}
