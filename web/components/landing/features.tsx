"use client";

import { Shield, Zap, Globe, Lock, Terminal, Activity } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

export function Features() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                    >
                        Everything you need to ship faster
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-xl text-muted-foreground"
                    >
                        Loophole provides the secure tunneling infrastructure your team needs to preview, test, and collaborate on local development.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <TiltCard
                        variants={item}
                        icon={<Lock className="w-6 h-6 text-emerald-400" />}
                        title="Secure by Default"
                        description="Automatic HTTPS for every tunnel. Zero-config TLS certificates provisioned instantly."
                    />
                    <TiltCard
                        variants={item}
                        icon={<Terminal className="w-6 h-6 text-blue-400" />}
                        title="Developer Friendly CLI"
                        description="A powerful CLI experience that gets out of your way. Tunnel http, tcp, or websockets with one command."
                    />
                    <TiltCard
                        variants={item}
                        icon={<Activity className="w-6 h-6 text-purple-400" />}
                        title="Traffic Inspection"
                        description="Real-time dashboard to inspect and replay requests. Debug webhooks with ease."
                    />
                    <TiltCard
                        variants={item}
                        icon={<Globe className="w-6 h-6 text-indigo-400" />}
                        title="Custom Domains"
                        description="Bring your own domain for branded tunnel URLs. SSL managed automatically."
                    />
                    <TiltCard
                        variants={item}
                        icon={<Shield className="w-6 h-6 text-orange-400" />}
                        title="Private Access"
                        description="Protect your preview environments with basic auth, IP whitelisting, or OAuth."
                    />
                    <TiltCard
                        variants={item}
                        icon={<Zap className="w-6 h-6 text-yellow-400" />}
                        title="Global Edge Network"
                        description="Low-latency connections routed through our globally distributed edge network."
                    />
                </motion.div>
            </div>
        </section>
    );
}

function TiltCard({ icon, title, description, variants }: { icon: React.ReactNode; title: string; description: string; variants?: any }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width - 0.5);
        y.set((clientY - top) / height - 0.5);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            variants={variants}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="group relative perspective-1000"
        >
            {/* Card Content */}
            <div className="h-full p-8 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative z-10 overflow-hidden shadow-2xl transition-shadow duration-500 group-hover:shadow-emerald-500/10">

                {/* Spotlight / Glare Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                    style={{
                        background: useTransform(
                            [mouseX, mouseY],
                            ([xVal, yVal]: any) => `radial-gradient(600px circle at ${(xVal + 0.5) * 100}% ${(yVal + 0.5) * 100}%, rgba(255,255,255,0.1), transparent 40%)`
                        )
                    }}
                />

                {/* Border highlight */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-500 z-10" />

                <div className="relative z-20" style={{ transform: "translateZ(50px)" }}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-wide">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
                </div>
            </div>
        </motion.div>
    )
}
