import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-PLAN] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user's phone from profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("phone_personal, email")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const telefone = profile.phone_personal;
    const email = profile.email;
    
    logStep("Profile found", { telefone, email });

    // Buscar plano na planilha Google Sheets
    const apiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_SHEETS_API_KEY not set");

    const spreadsheetId = "1jIe1jWiI0cTmb8W_A6VYLW7bxVzQPLG_9qJv2auwmRo";
    const range = "usuarios!A:D"; // telefono, plan, created_at, email
    
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    logStep("Fetching from Google Sheets");
    
    const sheetsResponse = await fetch(sheetsUrl);
    if (!sheetsResponse.ok) {
      throw new Error(`Google Sheets API error: ${sheetsResponse.status}`);
    }

    const sheetsData = await sheetsResponse.json();
    const rows = sheetsData.values || [];
    
    logStep("Sheets data fetched", { rowCount: rows.length });

    // Buscar linha do usuário (por telefone ou email)
    let userRow = null;
    let planFromSheets = "free";

    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      const rowTelefone = row[0] || "";
      const rowPlan = row[1] || "free";
      const rowEmail = row[3] || "";

      if (rowTelefone === telefone || rowEmail === email) {
        userRow = row;
        planFromSheets = rowPlan.toLowerCase();
        logStep("User found in sheets", { telefone: rowTelefone, email: rowEmail, plan: planFromSheets });
        break;
      }
    }

    if (!userRow) {
      logStep("User not found in sheets, keeping current plan");
      return new Response(
        JSON.stringify({ 
          synced: false, 
          message: "User not found in sheets",
          currentPlan: "free" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Atualizar plano no Supabase
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ 
        plan: planFromSheets,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    logStep("Plan updated in Supabase", { newPlan: planFromSheets });

    return new Response(
      JSON.stringify({
        synced: true,
        plan: planFromSheets,
        message: "Plan synchronized successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, synced: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
