"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

export function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse position relative to the center of the button
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics
    const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    function onMouseMove({ clientX, clientY }: React.MouseEvent) {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Calculate distance from center
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Move element slightly towards cursor (divide by factor to limit movement)
        x.set((clientX - centerX) * 0.3);
        y.set((clientY - centerY) * 0.3);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className={`relative inline-block ${className}`}
        >
            {children}
        </motion.div>
    );
}
