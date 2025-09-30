import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    // Get user's profile for phone number
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("phone_personal, phone_empresa, email")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const telefone = profile.phone_personal || profile.phone_empresa;
    logStep("Profile found", { telefone, email: profile.email });

    // Cancel Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        logStep("Found active subscription", { subscriptionId: subscription.id });

        // Cancel the subscription at period end
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
        logStep("Subscription cancelled in Stripe");
      } else {
        logStep("No active subscription found in Stripe");
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Update Google Sheets
    const apiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    if (!apiKey) throw new Error("GOOGLE_SHEETS_API_KEY not set");

    const spreadsheetId = "1WeIPDOTFkm748yEJBkNvWvG2MJHJpdaJAeen1fFzIk";
    const range = "usuarios!A:G";
    
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    logStep("Fetching from Google Sheets");
    
    const sheetsResponse = await fetch(sheetsUrl);
    if (!sheetsResponse.ok) {
      throw new Error(`Google Sheets API error: ${sheetsResponse.status}`);
    }

    const sheetsData = await sheetsResponse.json();
    const rows = sheetsData.values || [];
    
    logStep("Sheets data fetched", { rowCount: rows.length });

    // Normalize phone for comparison
    const normalizeTelefone = (tel: string) => tel.replace(/\D/g, '');
    const telefoneNormalizado = normalizeTelefone(telefone);
    
    // Find user row
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowTelefone = row[0] || "";
      const rowTelefoneNormalizado = normalizeTelefone(rowTelefone);

      if (rowTelefoneNormalizado === telefoneNormalizado) {
        rowIndex = i + 1; // Google Sheets is 1-indexed
        break;
      }
    }

    if (rowIndex > 0) {
      // Update the plan column (Column D = index 3) to "free"
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/usuarios!D${rowIndex}?valueInputOption=RAW&key=${apiKey}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [["free"]]
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update Google Sheets: ${updateResponse.status}`);
      }

      logStep("Updated plan in Google Sheets to 'free'", { rowIndex });
    } else {
      logStep("User not found in Google Sheets");
    }

    // Update Supabase profile
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ 
        plan: "free",
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    logStep("Plan updated in Supabase to 'free'");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription cancelled successfully",
        newPlan: "free"
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
      JSON.stringify({ error: errorMessage, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
