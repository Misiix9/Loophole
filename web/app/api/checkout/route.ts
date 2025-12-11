import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const plan = searchParams.get('plan') || 'monthly'; // monthly or yearly

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  // MOCK MODE: If key is not valid standard Stripe key (starts with sk_test or sk_live), simulate success
  // This allows the demo to work without real Stripe account.
  const isMockKey = !process.env.STRIPE_SECRET_KEY?.startsWith('sk_');

  if (isMockKey) {
     console.log('Using Mock Stripe Checkout for key:', process.env.STRIPE_SECRET_KEY);
     
     // Simulate DB Update directly since Webhook won't fire from real Stripe
     const { createAdminClient } = await import('@/utils/supabase/admin');
     const adminSupabase = createAdminClient();
     
     await adminSupabase.from('teams')
          .update({
              stripe_customer_id: 'cus_mock_12345',
              stripe_subscription_id: 'sub_mock_12345',
              subscription_status: 'active',
              plan_tier: 'pro'
          })
          .eq('id', teamId);

     const successUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/${teamId}?success=true&mock=true`;
     // Redirect immediately as if payment succeeded
     return NextResponse.redirect(successUrl, 303);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          // Replace with real Price IDs from your Stripe Dashboard
          price: plan === 'monthly' 
            ? (process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_mock_id')
            : (process.env.STRIPE_PRICE_ID_YEARLY || 'price_yearly_mock_id'),
          quantity: 1,
        },
      ],
      metadata: {
        teamId: teamId,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/${teamId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
