"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PricingContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400">Choose the plan that's right for your team.</p>
        {!teamId && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded text-sm inline-block">
                ⚠️ No Team Selected. Please navigate here from your Team Settings to upgrade.
            </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Free Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-300">Free</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="ml-1 text-slate-400">/month</span>
            </div>
            <p className="mt-4 text-slate-400">Perfect for hobbyists and side projects.</p>
          </div>
          <ul className="flex-1 space-y-4 mb-8">
            {['1 Team Member', '3 active tunnels', 'Random subdomains', 'Community Support'].map((feature) => (
              <li key={feature} className="flex items-center text-slate-300">
                <Check className="h-5 w-5 text-emerald-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" disabled>Current Plan</Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 border border-indigo-500 rounded-2xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMMENDED
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-medium text-indigo-400">Pro Team</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="ml-1 text-slate-400">/month</span>
            </div>
            <p className="mt-4 text-slate-400">For scaling teams and production workflows.</p>
          </div>
          <ul className="flex-1 space-y-4 mb-8">
            {['Unlimited Team Members', 'Unlimited tunnels', 'Custom Subdomains', 'Priority Support', 'SSO (Coming soon)'].map((feature) => (
              <li key={feature} className="flex items-center text-slate-300">
                <Check className="h-5 w-5 text-indigo-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
          
          {teamId ? (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href={`/api/checkout?teamId=${teamId}&plan=monthly`}>
                    Upgrade to Pro
                </Link>
              </Button>
          ) : (
              <Button className="w-full" disabled>Select Check Page</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
            <PricingContent />
        </Suspense>
    )
}
