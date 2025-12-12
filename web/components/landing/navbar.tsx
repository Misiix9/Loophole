"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useModal } from "@/context/modal-context";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Crown, Loader2, LogOut } from "lucide-react";
import { PLANS, PlanTier } from "@/lib/plans";

interface Profile {
    id: string;
    plan_tier: PlanTier;
    has_selected_plan: boolean;
}

export function Navbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const { openModal } = useModal();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50 && !isScrolled) setIsScrolled(true);
        if (latest <= 50 && isScrolled) setIsScrolled(false);
    });

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const init = async () => {
            try {
                const supabase = createClient();

                // Set a timeout to prevent infinite loading - 5 seconds max
                timeoutId = setTimeout(() => {
                    if (isMounted && loading) {
                        console.log("Auth check timed out");
                        setLoading(false);
                    }
                }, 5000);

                // Get current session (faster than getUser)
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (error) {
                    console.error("Session error:", error);
                    setLoading(false);
                    return;
                }

                if (session?.user) {
                    setUser(session.user);

                    // Try to fetch profile, but don't block on it
                    try {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('id, has_selected_plan, plan_tier')
                            .eq('id', session.user.id)
                            .single();

                        if (profileData && isMounted) {
                            setProfile(profileData);
                        }
                    } catch (profileErr) {
                        console.error("Profile fetch error:", profileErr);
                        // Continue without profile - will show default "Hobby"
                    }
                }

                if (isMounted) {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Init error:", err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        init();

        // Also listen for auth state changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log("Auth state changed:", event);

                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    setLoading(false);

                    // Fetch profile in background
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('id, has_selected_plan, plan_tier')
                        .eq('id', session.user.id)
                        .single();

                    if (profileData && isMounted) {
                        setProfile(profileData);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = useCallback(async () => {
        try {
            setSigningOut(true);
            const supabase = createClient();

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Sign out error:", error);
            }

            // Clear state
            setUser(null);
            setProfile(null);

            // Redirect to home
            window.location.href = '/';
        } catch (err) {
            console.error("Sign out failed:", err);
            setSigningOut(false);
        }
    }, []);

    const currentPlan = profile?.plan_tier || 'hobby';
    const currentPlanConfig = PLANS[currentPlan] || PLANS['hobby'];

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
                        <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="flex items-center justify-center w-[100px]">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-500">
                            {/* User Menu Dropdown */}
                            <div className="relative group">
                                <div className="hidden sm:flex items-center gap-3 text-sm font-medium py-2 cursor-pointer transition-opacity hover:opacity-80">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center border border-white/10">
                                            <span className="text-xs font-bold text-white">
                                                {(user.user_metadata?.full_name || user.email?.charAt(0) || "U").charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground group-hover:text-white transition-colors">
                                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-accent flex items-center gap-1">
                                            {currentPlan !== 'hobby' && <Crown size={10} />}
                                            {currentPlanConfig.name}
                                        </span>
                                    </div>
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
                                            onClick={handleSignOut}
                                            disabled={signingOut}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left disabled:opacity-50"
                                        >
                                            {signingOut ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Signing out...
                                                </>
                                            ) : (
                                                <>
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </>
                                            )}
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
                        <MagneticButton>
                            <button
                                onClick={() => openModal('auth')}
                                className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold block"
                            >
                                Sign In
                            </button>
                        </MagneticButton>
                    )}
                </div>
            </motion.header>
        </div>
    );
}
