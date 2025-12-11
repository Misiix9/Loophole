"use client";

import { motion } from "framer-motion";

export function Logos() {
    const companies = [
        { name: "Nebula", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=29" },
        { name: "Vertex", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=33" },
        { name: "Horizon", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=14" },
        { name: "Pinnacle", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=94" },
        { name: "Eclipse", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=65" },
        // Duplicate for seamless loop
        { name: "Nebula", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=29" },
        { name: "Vertex", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=33" },
        { name: "Horizon", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=14" },
        { name: "Pinnacle", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=94" },
        { name: "Eclipse", logo: "https://generative-placeholders.glitch.me/image?width=120&height=40&style=triangles&colors=65" },
    ];

    return (
        <section className="py-20 border-y border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Trusted by engineering teams at
                </p>
            </div>

            <div className="flex overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10"></div>

                <motion.div
                    className="flex gap-16 items-center flex-nowrap pl-16"
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {companies.map((company, i) => (
                        <div key={`${company.name}-${i}`} className="flex items-center gap-2 group whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity cursor-default">
                            <div className="h-8 w-8 rounded-full bg-white/10 group-hover:bg-accent transition-colors"></div>
                            <span className="text-2xl font-bold font-mono tracking-tighter text-foreground/80 group-hover:text-foreground transition-colors">{company.name}</span>
                        </div>
                    ))}
                    {/* Triple the list to ensure we have enough width for the scroll without gaps */}
                    {companies.map((company, i) => (
                        <div key={`${company.name}-duplicate-${i}`} className="flex items-center gap-2 group whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity cursor-default">
                            <div className="h-8 w-8 rounded-full bg-white/10 group-hover:bg-accent transition-colors"></div>
                            <span className="text-2xl font-bold font-mono tracking-tighter text-foreground/80 group-hover:text-foreground transition-colors">{company.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
