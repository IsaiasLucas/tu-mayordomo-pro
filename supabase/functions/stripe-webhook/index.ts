import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const n8nWebhook = Deno.env.get("API_BASE");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    if (!n8nWebhook) throw new Error("API_BASE is not set");

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMsg });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Process relevant events
    const relevantEvents = [
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
    ];

    if (relevantEvents.includes(event.type)) {
      logStep("Processing event", { type: event.type, id: event.id });

      // Extract customer information
      let customerEmail = "";
      let telefone = "";
      let customerId = "";
      let subscriptionStatus = "";
      let plan = "free";
      let eventData: any = {};

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        customerEmail = session.customer_email || "";
        customerId = session.customer as string;
        
        // Get customer metadata for phone number
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if ('metadata' in customer && customer.metadata) {
            telefone = customer.metadata.telefone || "";
          }
        }
        
        // Fetch subscription details if available
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionStatus = subscription.status;
          const priceId = subscription.items.data[0].price.id;
          
          // Map price to plan - all paid plans become "pro"
          const planMap: Record<string, string> = {
            "price_1SAb6WCGNOUldBA37lsDjBgB": "pro",
            "price_1SBRZJCGNOUldBA3dPc3DIqU": "pro",
            "price_1SCvQSCGNOUldBA3BNvCtbWE": "pro",
          };
          plan = planMap[priceId] || "pro";
        }

        eventData = {
          event_type: "payment_approved",
          action: "update_plan",
          email: customerEmail,
          telefone: telefone,
          plan: plan,
          old_plan: "free",
          customer_id: customerId,
          subscription_status: subscriptionStatus,
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          timestamp: new Date().toISOString(),
        };
      } else if (event.type.startsWith("customer.subscription.")) {
        const subscription = event.data.object as Stripe.Subscription;
        customerId = subscription.customer as string;
        subscriptionStatus = subscription.status;
        const priceId = subscription.items.data[0].price.id;

        // Fetch customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer) {
          customerEmail = customer.email || "";
        }
        if ('metadata' in customer && customer.metadata) {
          telefone = customer.metadata.telefone || "";
        }

        // Map price to plan - all paid plans are "pro", cancelled is "free"
        const planMap: Record<string, string> = {
          "price_1SAb6WCGNOUldBA37lsDjBgB": "pro",
          "price_1SBRZJCGNOUldBA3dPc3DIqU": "pro",
          "price_1SCvQSCGNOUldBA3BNvCtbWE": "pro",
        };
        plan = event.type === "customer.subscription.deleted" ? "free" : (planMap[priceId] || "pro");

        eventData = {
          event_type: event.type === "customer.subscription.deleted" ? "subscription_cancelled" : "subscription_updated",
          action: "update_plan",
          email: customerEmail,
          telefone: telefone,
          plan: plan,
          old_plan: event.type === "customer.subscription.deleted" ? "pro" : "free",
          customer_id: customerId,
          subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          current_period_end: subscription.current_period_end,
          timestamp: new Date().toISOString(),
        };
      } else if (event.type.startsWith("invoice.payment_")) {
        const invoice = event.data.object as Stripe.Invoice;
        customerId = invoice.customer as string;
        
        // Fetch customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer) {
          customerEmail = customer.email || "";
        }
        if ('metadata' in customer && customer.metadata) {
          telefone = customer.metadata.telefone || "";
        }

        const paymentStatus = event.type === "invoice.payment_succeeded" ? "succeeded" : "failed";
        const newPlan = paymentStatus === "succeeded" ? "pro" : "free";

        eventData = {
          event_type: paymentStatus === "succeeded" ? "payment_approved" : "payment_failed",
          action: paymentStatus === "succeeded" ? "update_plan" : "keep_plan",
          email: customerEmail,
          telefone: telefone,
          plan: newPlan,
          old_plan: "free",
          customer_id: customerId,
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          status: invoice.status,
          timestamp: new Date().toISOString(),
        };
      }

      // Update Supabase tables based on plan change
      if (eventData.action === "update_plan" && customerEmail) {
        logStep("Updating Supabase tables", { email: customerEmail, plan: eventData.plan });
        
        // Get user ID from email
        const { data: authUser } = await supabaseClient.auth.admin.listUsers();
        const targetUser = authUser?.users?.find(u => u.email === customerEmail);
        
        if (targetUser) {
          logStep("Found user", { userId: targetUser.id });
          
          // Update profiles table
          await supabaseClient
            .from("profiles")
            .update({ plan: eventData.plan })
            .eq("user_id", targetUser.id);
          
          logStep("Updated profiles table");
          
          // Update usuarios table if phone exists
          if (telefone) {
            const telefoneLimpo = telefone.replace(/\D/g, '');
            await supabaseClient
              .from("usuarios")
              .update({ plan: eventData.plan })
              .eq("telefono", telefoneLimpo);
            
            logStep("Updated usuarios table", { telefono: telefoneLimpo });
          }
        } else {
          logStep("User not found in Supabase", { email: customerEmail });
        }
      }

      logStep("Sending to n8n", { url: n8nWebhook, data: eventData });

      // Send to n8n
      const n8nResponse = await fetch(n8nWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!n8nResponse.ok) {
        logStep("n8n webhook failed", { status: n8nResponse.status });
        throw new Error(`n8n webhook failed with status ${n8nResponse.status}`);
      }

      logStep("Successfully sent to n8n");
    } else {
      logStep("Event ignored", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
