import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map price IDs to plan names
const PLAN_MAP: Record<string, string> = {
  "price_1SAb6WCGNOUldBA37lsDjBgB": "mensal",
  "price_1SBRZJCGNOUldBA3dPc3DIqU": "anual",
  "price_1SCvQSCGNOUldBA3BNvCtbWE": "estudante",
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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
      .select("phone_personal, phone_empresa")
      .eq("user_id", user.id)
      .single();

    const telefone = profile?.phone_personal || profile?.phone_empresa;
    logStep("Profile found", { telefone });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      
      // Update profile to free
      await supabaseClient
        .from("profiles")
        .update({ plan: "free" })
        .eq("user_id", user.id);
      
      // Update usuarios table if phone exists
      if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        await supabaseClient
          .from("usuarios")
          .update({ plan: "free" })
          .eq("telefono", telefoneLimpo);
      }

      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;

    if (!hasActiveSub) {
      logStep("No active subscription found");
      
      // Update profile to free
      await supabaseClient
        .from("profiles")
        .update({ 
          plan: "free",
          stripe_customer_id: customerId 
        })
        .eq("user_id", user.id);
      
      // Update usuarios table if phone exists
      if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        await supabaseClient
          .from("usuarios")
          .update({ plan: "free" })
          .eq("telefono", telefoneLimpo);
      }

      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const planName = PLAN_MAP[priceId] || "free";
    const subscriptionEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    logStep("Active subscription found", { 
      subscriptionId: subscription.id, 
      priceId, 
      planName,
      endDate: subscriptionEnd 
    });

    // Update profile with subscription info
    await supabaseClient
      .from("profiles")
      .update({
        plan: planName,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_renewal_date: subscriptionEnd,
      })
      .eq("user_id", user.id);

    logStep("Profile updated successfully");
    
    // Update usuarios table if phone exists
    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      await supabaseClient
        .from("usuarios")
        .update({ plan: planName })
        .eq("telefono", telefoneLimpo);
      
      logStep("Usuarios table updated successfully", { telefono: telefoneLimpo });
    }

    return new Response(
      JSON.stringify({
        subscribed: true,
        plan: planName,
        subscription_end: subscriptionEnd,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});