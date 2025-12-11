"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { motion } from "framer-motion";
import { useModal } from "@/context/modal-context";

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
                    <PricingCard
                        tier="Hobby"
                        price="$0"
                        desc="For tinkering and side projects."
                        features={[
                            "Unlimited HTTP tunnels",
                            "Random subdomains",
                            "1 local process",
                            "Community support"
                        ]}
                    />
                    <PricingCard
                        tier="Creator"
                        price="$9"
                        desc="For serious developers and freelancers."
                        features={[
                            "Everything in Hobby",
                            "3 Custom subdomains (alex.loophole.app)",
                            "3 concurrent tunnels",
                            "Password protection",
                            "TCP & WebSocket tunnels",
                            "Priority Email Support"
                        ]}
                        highlight
                    />
                    <PricingCard
                        tier="Startup"
                        price="$29"
                        desc="For small teams building next-gen apps."
                        features={[
                            "Everything in Creator",
                            "5 Team Members",
                            "Centralized dashboard",
                            "Team Audit logs",
                            "Shared custom domains",
                            "99.9% SLA"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}

function PricingCard({ tier, price, desc, features, highlight }: { tier: string; price: string; desc: string; features: string[]; highlight?: boolean }) {
    const { openModal } = useModal();

    return (
        <div className={`p-8 rounded-3xl border flex flex-col relative overflow-visible group perspective-1000 transition-all hover:scale-[1.02] duration-500 ${highlight ? 'bg-white/5 border-accent/50 shadow-2xl shadow-accent/10' : 'bg-white/[0.02] border-white/10'}`}>

            {/* Shimmer Border Effect */}
            <div className={`absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-3xl`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shimmer" />
            </div>

            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-20 shadow-lg shadow-accent/40">
                    Most Popular
                </div>
            )}

            <div className="mb-8 relative z-10">
                <h3 className="text-xl font-bold text-foreground mb-2">{tier}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>

            <div className="mb-8 relative z-10">
                <span className="text-4xl font-bold text-foreground">{price}</span>
                <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="mb-8 space-y-4 flex-1 relative z-10">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 rounded-full p-0.5 ${highlight ? 'bg-accent text-white' : 'bg-white/10 text-muted-foreground'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-muted-foreground">{f}</span>
                    </li>
                ))}
            </ul>

            {/* 3D Pop-out Button Container */}
            <div className="relative z-20 transform-style-3d group-hover:translate-z-10 transition-transform duration-300">
                <MagneticButton className="w-full">
                    <button onClick={() => openModal('auth')} className={`block w-full py-4 rounded-xl font-bold text-center transition-all 
                        ${highlight
                            ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_0_20px_rgba(var(--accent),0.4)] group-hover:shadow-[0_20px_40px_rgba(var(--accent),0.6)]'
                            : 'bg-white/10 text-foreground hover:bg-white/20 group-hover:bg-white' // Making non-highlight buttons pop more on hover
                        }
                        group-hover:scale-105
                    `}>
                        Get {tier}
                    </button>
                </MagneticButton>
            </div>
        </div>
    );
}
