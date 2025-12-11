import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let teamId = searchParams.get('teamId');
  const plan = searchParams.get('plan') || 'monthly';
  const isSetup = searchParams.get('setup') === 'true';

  // Resolving Team ID for auto-setup
  if (!teamId && isSetup) {
    // Fetch user's personal team
    const { data: teams } = await supabase.from('teams').select('id').limit(1);
    if (teams && teams.length > 0) {
      teamId = teams[0].id;
    } else {
      // Fallback: Create a team? For now, if no team, error out or redirect to onboarding.
      // Assuming triggers create a team on signup.
      return NextResponse.json({ error: 'No team found for user. Please complete onboarding.' }, { status: 400 });
    }
  }

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  // Define Price IDs
  const PRICES: Record<string, string> = {
    'creator': process.env.STRIPE_PRICE_ID_CREATOR || 'price_creator_mock',
    'startup': process.env.STRIPE_PRICE_ID_STARTUP || 'price_startup_mock',
    // Legacy support if needed
    'monthly': process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_mock',
  };

  const selectedPriceId = PRICES[plan];

  // MOCK MODE
  const isMockKey = !process.env.STRIPE_SECRET_KEY?.startsWith('sk_');

  if (isMockKey) {
    console.log('Using Mock Stripe Checkout for key:', process.env.STRIPE_SECRET_KEY);

    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminSupabase = createAdminClient();

    await adminSupabase.from('teams')
      .update({
        stripe_customer_id: 'cus_mock_' + Math.random().toString(36).substring(7),
        stripe_subscription_id: 'sub_mock_' + Math.random().toString(36).substring(7),
        subscription_status: 'active',
        plan_tier: plan // 'creator', 'startup'
      })
      .eq('id', teamId);

    const successUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&plan=${plan}`;
    return NextResponse.redirect(successUrl, 303);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        teamId: teamId,
        planTier: plan
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}?canceled=true`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
