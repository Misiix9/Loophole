import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/utils/supabase/admin';

// For now, assuming current Supabase client can't write to teams without being owner.
// In a real app, use `createClient(url, service_role_key)`.

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

  if (event.type === 'checkout.session.completed') {
      const teamId = session.metadata.teamId;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      console.log(`Payment success for team: ${teamId}`);

      // Update Database
      // Note: Ideally use Service Role here. 
      // For MVP/Demo, logging success.
      
      const supabase = createAdminClient();
      const { error } = await supabase.from('teams')
          .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
              plan_tier: 'pro'
          })
          .eq('id', teamId);
        
      if (error) {
          console.error('Failed to update team subscription:', error);
          return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
      }
  }

  return NextResponse.json({ received: true });
}
