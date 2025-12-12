import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const session = event.data.object as any;
  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata.userId;
    const planTier = session.metadata.planTier || 'creator';
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    console.log(`Payment success for user: ${userId}, plan: ${planTier}`);

    // Update user's profile with subscription info
    const { error } = await supabase.from('profiles')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        plan_tier: planTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update user subscription:', error);
      return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscriptionId = session.id;
    const status = session.status; // 'active', 'canceled', 'past_due', etc.
    const periodEnd = new Date(session.current_period_end * 1000).toISOString();

    // Find user by subscription ID and update status
    const { error } = await supabase.from('profiles')
      .update({
        subscription_status: status,
        subscription_period_end: periodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Failed to update subscription status:', error);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscriptionId = session.id;

    // Downgrade user to hobby plan
    const { error } = await supabase.from('profiles')
      .update({
        plan_tier: 'hobby',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Failed to cancel subscription:', error);
    }
  }

  return NextResponse.json({ received: true });
}
