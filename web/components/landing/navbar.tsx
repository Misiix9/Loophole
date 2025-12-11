"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useModal } from "@/context/modal-context";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";

export function Navbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const { openModal } = useModal();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50 && !isScrolled) setIsScrolled(true);
        if (latest <= 50 && isScrolled) setIsScrolled(false);
    });

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    return (
        <div className="flex justify-center w-full fixed top-0 z-50 transition-all duration-300 pointer-events-none">
            <motion.header
                initial={{
                    width: "100%",
                    y: 0,
                    borderRadius: "0px",
                    border: "1px solid transparent",
                    backgroundColor: "rgba(0,0,0,0)",
                    backdropFilter: "blur(0px)"
                }}
                animate={{
                    width: isScrolled ? "fit-content" : "100%",
                    marginTop: isScrolled ? "1.5rem" : "0rem",
                    borderRadius: isScrolled ? "9999px" : "0px",
                    border: isScrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent",
                    backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
                    backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
                    paddingLeft: isScrolled ? "1.5rem" : "2rem",
                    paddingRight: isScrolled ? "1.5rem" : "2rem"
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 1
                }}
                className="flex items-center justify-between py-4 pointer-events-auto shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                style={{
                    maxWidth: isScrolled ? "900px" : "100%",
                    minWidth: isScrolled ? "600px" : "100%"
                }}
            >
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Loophole"
                        width={32}
                        height={32}
                        className="rounded-lg shadow-lg shadow-accent/20"
                    />
                    <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                        Loophole
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-6 mx-8">
                    {["Features", "Pricing", "About"].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()} `} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {!loading && user ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-500">
                            <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
                                {user.user_metadata?.avatar_url ? (
                                    <Image src={user.user_metadata.avatar_url} alt="Profile" width={32} height={32} className="rounded-full border border-white/10" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <UserIcon size={16} />
                                    </div>
                                )}
                                <span className="text-muted-foreground">
                                    {user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0]}
                                </span>
                            </div>
                            <MagneticButton>
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold block"
                                >
                                    Dashboard
                                </Link>
                            </MagneticButton>
                        </div>
                    ) : (
                        !loading && (
                            <MagneticButton>
                                <button
                                    onClick={() => openModal('auth')}
                                    className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold block"
                                >
                                    Sign In
                                </button>
                            </MagneticButton>
                        )
                    )}
                </div>
            </motion.header>
        </div>
    );
}

