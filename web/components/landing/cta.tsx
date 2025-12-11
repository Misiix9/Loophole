"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function CTA() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <section ref={containerRef} className="py-32 px-4 overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    style={{ scale, opacity }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent to-indigo-900 border border-white/10 p-12 md:p-24 text-center"
                >
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[80px]"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to tunnel out?</h2>
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                            Join thousands of developers who trust Loophole for their local development workflow. Open source and free to start.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/dashboard"
                                className="h-14 px-8 rounded-full bg-white text-accent font-bold text-lg flex items-center justify-center hover:bg-gray-100 transition-all hover:scale-105 shadow-xl w-full sm:w-auto"
                            >
                                Get Started for Free
                            </Link>
                            <Link
                                href="/contact"
                                className="h-14 px-8 rounded-full bg-transparent border border-white/30 text-white font-bold text-lg flex items-center justify-center hover:bg-white/10 transition-all w-full sm:w-auto gap-2 group"
                            >
                                Contact Sales <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
