import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
      logStep("Webhook signature verification failed", { error: err.message });
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
      let customerId = "";
      let subscriptionStatus = "";
      let plan = "free";
      let eventData: any = {};

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        customerEmail = session.customer_email || "";
        customerId = session.customer as string;
        
        // Fetch subscription details if available
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionStatus = subscription.status;
          const priceId = subscription.items.data[0].price.id;
          
          // Map price to plan
          const planMap: Record<string, string> = {
            "price_1SAb6WCGNOUldBA37lsDjBgB": "mensal",
            "price_1SBRZJCGNOUldBA3dPc3DIqU": "anual",
            "price_1SCvQSCGNOUldBA3BNvCtbWE": "estudante",
          };
          plan = planMap[priceId] || "pro";
        }

        eventData = {
          event_type: event.type,
          customer_email: customerEmail,
          customer_id: customerId,
          subscription_status: subscriptionStatus,
          plan: plan,
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
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

        // Map price to plan
        const planMap: Record<string, string> = {
          "price_1SAb6WCGNOUldBA37lsDjBgB": "mensal",
          "price_1SBRZJCGNOUldBA3dPc3DIqU": "anual",
          "price_1SCvQSCGNOUldBA3BNvCtbWE": "estudante",
        };
        plan = event.type === "customer.subscription.deleted" ? "free" : (planMap[priceId] || "pro");

        eventData = {
          event_type: event.type,
          customer_email: customerEmail,
          customer_id: customerId,
          subscription_id: subscription.id,
          subscription_status: subscriptionStatus,
          plan: plan,
          current_period_end: subscription.current_period_end,
        };
      } else if (event.type.startsWith("invoice.payment_")) {
        const invoice = event.data.object as Stripe.Invoice;
        customerId = invoice.customer as string;
        
        // Fetch customer details
        const customer = await stripe.customers.retrieve(customerId);
        if ('email' in customer) {
          customerEmail = customer.email || "";
        }

        eventData = {
          event_type: event.type,
          customer_email: customerEmail,
          customer_id: customerId,
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid,
          status: invoice.status,
        };
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
