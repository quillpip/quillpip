import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Map a Stripe subscription status onto our narrower `subscriptions.status`
// check constraint (active | past_due | canceled | trialing | incomplete).
function normalizeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
      return stripeStatus;
    default:
      // incomplete, incomplete_expired, unpaid, paused
      return "incomplete";
  }
}

async function upsertFromSubscription(
  admin: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error("Stripe subscription missing supabase_user_id metadata", subscription.id);
    return;
  }

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: normalizeStatus(subscription.status),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ["items"] }
        );
        // Checkout session metadata carries the user id through if the
        // subscription itself doesn't have it yet.
        if (!subscription.metadata?.supabase_user_id && session.client_reference_id) {
          await stripe.subscriptions.update(subscription.id, {
            metadata: { supabase_user_id: session.client_reference_id },
          });
          subscription.metadata.supabase_user_id = session.client_reference_id;
        }
        await upsertFromSubscription(admin, subscription);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(admin, subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        await admin
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await admin
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);
      // Optionally: send a payment-failed email here.
      break;
    }

    default:
      // Unhandled event types are fine to ignore.
      break;
  }

  return NextResponse.json({ received: true });
}

// Note: App Router route handlers don't parse the body automatically —
// request.text() above already gives Stripe the raw bytes it needs to
// verify the signature. No bodyParser config needed here (that's a
// Pages Router concept).
