import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { PlanTier } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const plan = (searchParams.get('plan') || 'creator') as PlanTier;

  // Hobby plan is free, no checkout needed
  if (plan === 'hobby') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Define Price IDs
  const PRICES: Record<string, string> = {
    'creator': process.env.STRIPE_PRICE_ID_CREATOR || 'price_creator_mock',
    'startup': process.env.STRIPE_PRICE_ID_STARTUP || 'price_startup_mock',
  };

  const selectedPriceId = PRICES[plan];

  if (!selectedPriceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // MOCK MODE - If no valid Stripe key, simulate successful payment
  const isMockKey = !process.env.STRIPE_SECRET_KEY?.startsWith('sk_');

  if (isMockKey) {
    console.log('Using Mock Stripe Checkout for plan:', plan);

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    // Update user's profile directly (mock payment success)
    await adminSupabase.from('profiles')
      .update({
        stripe_customer_id: 'cus_mock_' + Math.random().toString(36).substring(7),
        stripe_subscription_id: 'sub_mock_' + Math.random().toString(36).substring(7),
        subscription_status: 'active',
        plan_tier: plan,
        subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    const successUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/settings?success=true&plan=${plan}`;
    return NextResponse.redirect(successUrl, 303);
  }

  // Real Stripe checkout
  try {
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase.from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planTier: plan
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/settings?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/settings?canceled=true`,
    };

    // Use existing customer if available
    if (profile?.stripe_customer_id) {
      sessionConfig.customer = profile.stripe_customer_id;
    } else {
      sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.redirect(session.url!, 303);
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
