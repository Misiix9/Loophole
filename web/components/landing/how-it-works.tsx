"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HowItWorks() {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

    // Only enable horizontal scroll logic on larger screens to avoid issues on mobile
    // For mobile, we will fallback to vertical stacking via CSS mostly

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-black/20">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <div className="absolute top-10 left-10 md:left-20 z-10 max-w-md">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-black/50 backdrop-blur-md p-2 rounded-lg inline-block">From Local to Global</h2>
                    <p className="text-muted-foreground text-lg bg-black/50 backdrop-blur-md p-2 rounded-lg">
                        Scroll down to see the magic happen.
                    </p>
                </div>

                <motion.div style={{ x }} className="flex gap-12 pl-[10vw] md:pl-[40vw]">
                    <Step
                        number="01"
                        title="Install the CLI"
                        desc="Install our lightweight CLI tool globally on your machine via npm or brew."
                        code="npm i -g @loophole/cli"
                    />
                    <Step
                        number="02"
                        title="Start a Tunnel"
                        desc="Run a simple command pointing to your local server port."
                        code="loophole http 3000"
                    />
                    <Step
                        number="03"
                        title="Share the URL"
                        desc="Get a secure public URL instantly. Send it to your team or clients."
                        code="https://clean-badger-42.loophole.site"
                        isUrl
                    />
                    <Step
                        number="04"
                        title="Inspect Traffic"
                        desc="Open the dashboard to inspect requests and replay webhooks in real-time."
                        code="loophole dashboard"
                    />
                </motion.div>
            </div>
        </section>
    );
}

function Step({ number, title, desc, code, isUrl }: { number: string; title: string; desc: string; code: string; isUrl?: boolean }) {
    return (
        <div className="relative h-[450px] w-[350px] md:w-[500px] shrink-0 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 flex flex-col justify-center backdrop-blur-sm">
            <div className="text-9xl font-black text-white/[0.03] absolute top-4 right-8 select-none">
                {number}
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 mt-4 text-foreground">{title}</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{desc}</p>
                <div className={`rounded-xl bg-black/60 p-6 font-mono text-base border border-white/5 shadow-2xl ${isUrl ? 'text-emerald-400' : 'text-accent-foreground'}`}>
                    {isUrl ? (
                        <span className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="truncate">{code}</span>
                        </span>
                    ) : (
                        <>
                            <span className="text-muted-foreground select-none mr-3">$</span>
                            {code}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
