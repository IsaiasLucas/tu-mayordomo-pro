import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create Supabase admin client (service role) for destructive operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Validate the incoming user using the Authorization header (anon client)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log(`Deleting user account: ${user.id}`);

    // Get user profile to retrieve phone number
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('phone_personal, phone_empresa')
      .eq('user_id', user.id)
      .single();

    // Delete all related data before deleting the user
    
    // 1. Delete gastos (expenses)
    const { error: gastosError } = await supabaseAdmin
      .from('gastos')
      .delete()
      .eq('user_id', user.id);

    if (gastosError) {
      console.error('[INTERNAL] Error deleting gastos:', gastosError);
    }

    // 2. Delete reportes (reports)
    const { error: reportesError } = await supabaseAdmin
      .from('reportes')
      .delete()
      .eq('user_id', user.id);

    if (reportesError) {
      console.error('[INTERNAL] Error deleting reportes:', reportesError);
    }

    // 3. Delete entities
    const { error: entitiesError } = await supabaseAdmin
      .from('entities')
      .delete()
      .eq('user_id', user.id);

    if (entitiesError) {
      console.error('[INTERNAL] Error deleting entities:', entitiesError);
    }

    // 4. Delete student verifications
    const { error: verificationsError } = await supabaseAdmin
      .from('student_verifications')
      .delete()
      .eq('user_id', user.id);

    if (verificationsError) {
      console.error('[INTERNAL] Error deleting student_verifications:', verificationsError);
    }

    // 5. Delete invitation codes (if user is empresa)
    const { error: invitationsError } = await supabaseAdmin
      .from('invitation_codes')
      .delete()
      .eq('company_id', user.id);

    if (invitationsError) {
      console.error('[INTERNAL] Error deleting invitation_codes:', invitationsError);
    }

    // 6. Delete accounts
    const { error: accountsError } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('user_id', user.id);

    if (accountsError) {
      console.error('[INTERNAL] Error deleting accounts:', accountsError);
    }

    // 7. Delete from usuarios table if phone exists
    if (profile) {
      const phone = profile.phone_personal || profile.phone_empresa;
      if (phone) {
        // Extract only digits for usuarios table
        const phoneDigits = phone.replace(/\D/g, '');
        
        const { error: usuariosError } = await supabaseAdmin
          .from('usuarios')
          .delete()
          .eq('telefono', phoneDigits);

        if (usuariosError) {
          console.error('[INTERNAL] Error deleting from usuarios:', usuariosError);
        }
      }
    }

    // 8. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      console.error('[INTERNAL] Error deleting profile:', profileError);
      // Continue anyway to delete the auth user
    }

    // Delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[INTERNAL] Error deleting user:', deleteError);
      throw new Error('Error al eliminar la cuenta');
    }

    console.log(`User account deleted successfully: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'User account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[INTERNAL] Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar la cuenta. Por favor intenta nuevamente.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
