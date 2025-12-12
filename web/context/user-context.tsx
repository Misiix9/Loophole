"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { PlanTier } from "@/lib/plans";

export interface UserProfile {
    id: string;
    email: string | null;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    plan_tier: PlanTier;
    has_selected_plan: boolean;
    subscription_status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_period_end: string | null;
}

interface UserContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    isLoggedIn: boolean;
    currentPlan: PlanTier;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            setProfile(data as UserProfile);
        }
        return data;
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    }, [user?.id, fetchProfile]);

    useEffect(() => {
        const supabase = createBrowserClient();

        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                await fetchProfile(user.id);
            }

            setLoading(false);
        };

        initUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const value: UserContextType = {
        user,
        profile,
        loading,
        refreshProfile,
        isLoggedIn: !!user,
        currentPlan: profile?.plan_tier || 'hobby',
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
