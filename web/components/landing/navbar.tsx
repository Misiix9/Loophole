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
        if (latest > 50 && !isScrolled) setIsScrolled(teling service like auto - reconnect, request logging, default port, API key management, etc.
        
        Go to / dashboard / settings to see the new page!rue);
        if (latest <= 50 && isScrolled) setIsScrolled(false);
    });

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);

            if (user) {
                // Ensure profile exists in database
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (!profile) {
                    // Create profile if it doesn't exist
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        email: user.email,
                        display_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                        avatar_url: user.user_metadata?.avatar_url || '',
                        username: user.user_metadata?.username || null,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                }

                // Onboarding: Check if username is missing
                if (!user.user_metadata?.username) {
                    openModal("username_setup");
                }
            }
        };
        checkUser();
    }, [openModal]);

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

                            {/* User Menu Dropdown */}
                            <div className="relative group">
                                <div
                                    className="hidden sm:flex items-center gap-3 text-sm font-medium py-2 cursor-pointer transition-opacity hover:opacity-80"
                                >
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center border border-white/10">
                                            <span className="text-xs font-bold text-white">
                                                {(user.user_metadata?.full_name || user.user_metadata?.username || user.email?.charAt(0) || "U").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-muted-foreground group-hover:text-white transition-colors">
                                        {user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                </div>

                                {/* Dropdown */}
                                <div className="absolute top-full right-0 pt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1">
                                        <button
                                            onClick={() => openModal('settings')}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                        >
                                            Settings
                                        </button>
                                        <button
                                            onClick={() => openModal('billing')}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                        >
                                            Billing
                                        </button>
                                        <div className="h-px bg-white/10 my-1 mx-2" />
                                        <button
                                            onClick={async () => {
                                                const supabase = createBrowserClient();
                                                await supabase.auth.signOut();
                                                setUser(null);
                                                window.location.reload();
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
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

