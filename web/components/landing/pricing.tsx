"use client";

import { Check, Crown } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useModal } from "@/context/modal-context";
import { useUser } from "@/context/user-context";
import { PLANS, PLAN_ORDER, PlanTier } from "@/lib/plans";

export function Pricing() {
    return (
        <section className="py-32 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <span className="text-accent font-semibold tracking-wider text-sm uppercase mb-2 block">Pricing</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Pricing that scales with you</h2>
                    <p className="text-muted-foreground text-lg">Fair prices. No hidden fees. Cancel anytime.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-1000">
                    {PLAN_ORDER.map((planId) => {
                        const plan = PLANS[planId];
                        return (
                            <PricingCard
                                key={plan.id}
                                tier={plan.id}
                                name={plan.name}
                                price={plan.priceDisplay}
                                desc={plan.description}
                                features={plan.features}
                                highlight={plan.popular}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function PricingCard({
    tier,
    name,
    price,
    desc,
    features,
    highlight
}: {
    tier: PlanTier;
    name: string;
    price: string;
    desc: string;
    features: string[];
    highlight?: boolean
}) {
    const { openModal } = useModal();
    const { isLoggedIn, currentPlan, profile } = useUser();

    // Check if this is the user's current plan
    const isCurrentPlan = isLoggedIn && currentPlan === tier;

    // Check if user has a higher plan (for showing "Current Plan" on lower tiers)
    const planRank = { hobby: 0, creator: 1, startup: 2 };
    const userHasHigherPlan = isLoggedIn && planRank[currentPlan] > planRank[tier];

    const handleClick = () => {
        if (!isLoggedIn) {
            // Not logged in - open auth modal
            openModal("auth");
            return;
        }

        if (isCurrentPlan) {
            // Already on this plan - do nothing or go to dashboard
            window.location.href = '/dashboard/settings';
            return;
        }

        if (tier === 'hobby') {
            // Downgrading to hobby - redirect to billing settings
            window.location.href = '/dashboard/settings?tab=billing';
            return;
        }

        // Upgrading to a paid plan - redirect to checkout
        window.location.href = `/api/checkout?plan=${tier}`;
    };

    // Determine button text
    let buttonText = `Get ${name}`;
    if (isCurrentPlan) {
        buttonText = "Current Plan";
    } else if (userHasHigherPlan) {
        buttonText = "Downgrade";
    } else if (isLoggedIn && tier !== 'hobby') {
        buttonText = `Upgrade to ${name}`;
    }

    return (
        <div className={`p-8 rounded-3xl border flex flex-col relative overflow-visible group perspective-1000 transition-all hover:scale-[1.02] duration-500 ${highlight ? 'bg-white/5 border-accent/50 shadow-2xl shadow-accent/10' : 'bg-white/[0.02] border-white/10'} ${isCurrentPlan ? 'ring-2 ring-accent' : ''}`}>

            {/* Shimmer Border Effect */}
            <div className={`absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-3xl`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
            </div>

            {/* Current Plan Badge */}
            {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-20 shadow-lg shadow-accent/40 flex items-center gap-1.5">
                    <Crown size={12} />
                    Your Plan
                </div>
            )}

            {/* Most Popular Badge (only show if not current plan) */}
            {highlight && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-20 shadow-lg shadow-accent/40">
                    Most Popular
                </div>
            )}

            <div className="mb-8 relative z-10">
                <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>

            <div className="mb-8 relative z-10">
                <span className="text-4xl font-bold text-foreground">{price}</span>
                <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="mb-8 space-y-4 flex-1 relative z-10">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 rounded-full p-0.5 ${highlight || isCurrentPlan ? 'bg-accent text-white' : 'bg-white/10 text-muted-foreground'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-muted-foreground">{f}</span>
                    </li>
                ))}
            </ul>

            <div className="relative z-10 transform-style-3d">
                <MagneticButton>
                    <button
                        onClick={handleClick}
                        disabled={isCurrentPlan}
                        className={`
                            w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all duration-300 ease-out
                            transform-gpu translate-z-0 group-hover:translate-z-10
                            ${isCurrentPlan
                                ? 'bg-accent/20 text-accent cursor-default'
                                : highlight
                                    ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_0_20px_rgba(var(--accent),0.4)] group-hover:shadow-[0_20px_40px_rgba(var(--accent),0.6)]'
                                    : 'bg-white/10 text-foreground hover:bg-white/20 group-hover:bg-white group-hover:text-black'
                            }
                            ${!isCurrentPlan && 'group-hover:scale-105'}
                        `}>
                        {buttonText}
                    </button>
                </MagneticButton>
            </div>
        </div>
    );
}
