import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common student email domains
const STUDENT_DOMAINS = [
  ".edu", ".edu.br", ".edu.ar", ".edu.cl", ".edu.co", ".edu.pe",
  ".ac.uk", ".ac.jp", ".ac.kr", ".ac.nz", ".ac.za",
  "estudiantes.", "alumnos.", "student."
];

const isStudentEmail = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  return STUDENT_DOMAINS.some(domain => lowerEmail.includes(domain));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { studentEmail } = await req.json();
    
    if (!studentEmail || typeof studentEmail !== "string") {
      throw new Error("Email estudante é obrigatório");
    }

    // Validar se é email estudante
    if (!isStudentEmail(studentEmail)) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Este email não parece ser de uma instituição educacional. Use um email com domínio .edu ou similar."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Salvar email estudante no perfil
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        student_email: studentEmail,
        student_verified: true,
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        valid: true,
        message: "Email estudante verificado com sucesso!"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in verify-student-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});