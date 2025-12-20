import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    const { priceId, planId } = await req.json();
    
    if (!priceId) throw new Error("Price ID is required");
    
    logStep("Received request", { priceId, planId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    logStep("Stripe client initialized");

    // Get price details to check currency
    const price = await stripe.prices.retrieve(priceId);
    const priceCurrency = price.currency.toLowerCase();
    logStep("Price currency", { priceCurrency });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let useCustomerEmail = false;
    
    if (customers.data.length > 0) {
      const existingCustomer = customers.data[0];
      logStep("Existing customer found", { customerId: existingCustomer.id });
      
      // Check if customer has subscriptions in a different currency
      const subscriptions = await stripe.subscriptions.list({
        customer: existingCustomer.id,
        limit: 10,
      });
      
      const hasDifferentCurrency = subscriptions.data.some((sub: { currency?: string }) => {
        return sub.currency && sub.currency.toLowerCase() !== priceCurrency;
      });
      
      if (hasDifferentCurrency) {
        logStep("Customer has subscriptions in different currency, will create new customer during checkout");
        useCustomerEmail = true;
      } else {
        customerId = existingCustomer.id;
      }
    } else {
      logStep("No existing customer, will create during checkout");
      useCustomerEmail = true;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: useCustomerEmail ? user.email : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/inicio?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/planes?checkout=canceled`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan_id: planId || "unknown",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});