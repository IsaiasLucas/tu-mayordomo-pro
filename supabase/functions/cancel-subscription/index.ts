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
        
        // Update plan to free in both tables
        await supabaseClient
          .from("profiles")
          .update({ plan: "free" })
          .eq("user_id", user.id);
        
        logStep("Updated profiles table to free");
        
        // Update usuarios table if phone exists
        if (telefone) {
          const telefoneLimpo = telefone.replace(/\D/g, '');
          await supabaseClient
            .from("usuarios")
            .update({ plan: "free" })
            .eq("telefono", telefoneLimpo);
          
          logStep("Updated usuarios table to free", { telefono: telefoneLimpo });
        }
      } else {
        logStep("No active subscription found in Stripe");
      }
    } else {
      logStep("No Stripe customer found");
    }

    logStep("Subscription will be cancelled at period end. Plan will remain active until then.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be cancelled at the end of the current billing period",
        cancelAtPeriodEnd: true
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
