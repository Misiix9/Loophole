"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 relative overflow-hidden">
            {/* Animated Glass Orbs */}
            <FloatingOrb
                color="bg-indigo-500"
                size="w-[500px] h-[500px]"
                initialX="-50%"
                initialY="-50%"
                top="50%"
                left="30%"
                delay={0}
            />
            <FloatingOrb
                color="bg-emerald-500"
                size="w-[400px] h-[400px]"
                initialX="-50%"
                initialY="-50%"
                top="30%"
                left="70%"
                delay={2}
            />
            <FloatingOrb
                color="bg-purple-500"
                size="w-[600px] h-[600px]"
                initialX="-50%"
                initialY="-50%"
                top="80%"
                left="50%"
                delay={4}
            />

            {/* Mesh Overlay for Texture */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-125 brightness-100"></div>


            <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center max-w-7xl mx-auto">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm text-accent-foreground shadow-[0_0_30px_-5px_rgba(var(--accent),0.3)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    <span className="font-semibold tracking-wide text-xs uppercase">v1.2 Release</span>
                </div>

                <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.9] mix-blend-overlay text-white opacity-90">
                    Tunnel <br /> Vision
                </h1>

                <p className="text-2xl text-muted-foreground/80 max-w-2xl mb-12 leading-relaxed font-light backdrop-blur-sm rounded-xl p-4">
                    The most secure and fastest way to expose your local server to the internet. <br className="hidden md:block" />
                    <span className="text-white font-medium">Local to Global in seconds.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mb-16">
                    <Link
                        href="/dashboard"
                        className="h-16 px-12 rounded-full bg-white text-black font-bold text-xl flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] w-full sm:w-auto"
                    >
                        Start Tunneling
                    </Link>
                    <div className="h-16 px-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl text-white/70 font-mono text-lg flex items-center justify-center w-full sm:w-auto cursor-copy hover:bg-white/10 transition-colors group"
                        onClick={() => navigator.clipboard.writeText('npm i -g @loophole/cli')}
                    >
                        <span className="mr-4 text-emerald-400">$</span> npm i -g @loophole/cli
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
                >
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
                        <div className="w-1 h-2 bg-white/50 rounded-full"></div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

function FloatingOrb({ color, size, top, left, delay, initialX, initialY }: any) {
    return (
        <motion.div
            className={`absolute ${size} ${color} rounded-full blur-[100px] opacity-30 mix-blend-screen pointer-events-none -z-10`}
            style={{ top, left, x: initialX, y: initialY }}
            animate={{
                x: [initialX, `calc(${initialX} + 10%)`, `calc(${initialX} - 10%)`, initialX],
                y: [initialY, `calc(${initialY} - 10%)`, `calc(${initialY} + 10%)`, initialY],
                scale: [1, 1.1, 0.9, 1]
            }}
            transition={{
                duration: 10 + delay,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay
            }}
        />
    )
}
