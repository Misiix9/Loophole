"use client";

import { useState, useEffect } from "react";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Mail, Check, CreditCard, Sparkles, Crown, ArrowRight, Building, Zap, Shield, RefreshCw, Settings } from "lucide-react";
import { useModal } from "@/context/modal-context";
import { PLANS } from "@/lib/plans";

export function AuthModalContent({ view = "auth" }: { view?: "auth" | "plan" | "username" | "settings" | "billing" }) {
    if (view === "plan") {
        return <PlanSelectionView />
    }
    if (view === "username") {
        return <UsernameView />
    }
    if (view === "settings") {
        return <SettingsView />
    }
    if (view === "billing") {
        return <BillingView />
    }
    return <AuthView />
}

function UsernameView() {
    const supabase = createBrowserClient();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const { closeModal } = useModal();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        // check uniqueness? DB Trigger would fail on insert if duplicate, 
        // but here we are updating user metadata. 
        // Ideally we check via RPC or table select.
        // For now, simpler: just update metadata. 
        // The trigger will try to insert into profiles. If it fails due to unique constraint, we have an issue.
        // But updating auth metadata doesn't automatically fail if Trigger fails (triggers are side effects).
        // Let's assume happy path or simple update.

        const { error } = await supabase.auth.updateUser({
            data: { username: username, full_name: username }
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            // Force reload to update navbar state or just close?
            // Navbar listens to onAuthStateChange hopefully.
            window.location.reload(); // safest to ensure all state is sync
        }
    }

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">One Last Thing</h2>
                <p className="text-muted-foreground text-sm">Choose a username to complete your profile.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Username</label>
                    <input
                        type="text"
                        placeholder="loopuser123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>
                {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                <button
                    disabled={loading}
                    className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm mt-2"
                >
                    {loading ? "Saving..." : "Start Using Loophole"}
                </button>
            </form>
        </div>
    )
}

function AuthView() {
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
    const [authMethod, setAuthMethod] = useState<'password' | 'magic'>('password');
    const [sent, setSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleOAuth(provider: 'github' | 'google') {
        setLoading(true);
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
            }
        });
    }

    async function handlePasswordAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (mode === 'register') {
                // Sign up with password
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                        data: {
                            username: username,
                            full_name: username
                        }
                    }
                });
                if (error) {
                    setErrorMsg(error.message);
                } else {
                    setSent(true);
                }
            } else {
                // Sign in with password
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    setErrorMsg(error.message);
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (err) {
            setErrorMsg('Authentication failed');
        }

        setLoading(false);
    }

    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    data: mode === 'register' ? { username, full_name: username } : undefined
                }
            });
            if (error) {
                setErrorMsg(error.message);
            } else {
                setSent(true);
            }
        } catch (err) {
            setErrorMsg('Failed to send magic link');
        }

        setLoading(false);
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`
            });
            if (error) {
                setErrorMsg(error.message);
            } else {
                setSent(true);
            }
        } catch (err) {
            setErrorMsg('Failed to send reset email');
        }

        setLoading(false);
    }

    // Success state
    if (sent) {
        return (
            <div className="p-10 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
                <p className="text-muted-foreground">
                    {mode === 'forgot'
                        ? <>We sent a password reset link to <span className="text-white">{email}</span></>
                        : mode === 'register'
                            ? <>Confirm your account at <span className="text-white">{email}</span></>
                            : <>We sent a magic link to <span className="text-white">{email}</span></>
                    }
                </p>
                <button onClick={() => { setSent(false); setMode('signin'); }} className="mt-6 text-sm text-muted-foreground hover:text-white underline">
                    Back to Sign In
                </button>
            </div>
        );
    }

    // Forgot password view
    if (mode === 'forgot') {
        return (
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                    <p className="text-muted-foreground text-sm">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-bold uppercase">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                    </div>

                    {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                    <button
                        disabled={loading}
                        className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <button
                    onClick={() => setMode('signin')}
                    className="w-full mt-4 text-sm text-muted-foreground hover:text-white"
                >
                    Back to Sign In
                </button>
            </div>
        );
    }

    // Main auth view
    return (
        <div className="p-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setMode('signin')}
                    className={`pb-2 text-sm font-bold transition-colors border-b-2 ${mode === 'signin' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-white'}`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => setMode('register')}
                    className={`pb-2 text-sm font-bold transition-colors border-b-2 ${mode === 'register' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-white'}`}
                >
                    Register
                </button>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-muted-foreground text-sm">Enter your details to continue</p>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => handleOAuth('github')}
                    disabled={loading}
                    className="h-10 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
                >
                    <Github size={18} />
                    GitHub
                </button>
                <button
                    onClick={() => handleOAuth('google')}
                    disabled={loading}
                    className="h-10 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-muted-foreground">Or with email</span></div>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg">
                <button
                    onClick={() => setAuthMethod('password')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${authMethod === 'password' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                    Password
                </button>
                <button
                    onClick={() => setAuthMethod('magic')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${authMethod === 'magic' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                    Magic Link
                </button>
            </div>

            {/* Form */}
            <form onSubmit={authMethod === 'password' ? handlePasswordAuth : handleMagicLink} className="space-y-4">
                {mode === 'register' && (
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-bold uppercase">Username</label>
                        <input
                            type="text"
                            placeholder="loopuser123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Email Address</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                {authMethod === 'password' && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-muted-foreground font-bold uppercase">Password</label>
                            {mode === 'signin' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-xs text-accent hover:underline"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                    </div>
                )}

                {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                <button
                    disabled={loading}
                    className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm mt-2"
                >
                    {loading
                        ? "Processing..."
                        : authMethod === 'magic'
                            ? "Send Magic Link"
                            : mode === 'signin'
                                ? "Sign In"
                                : "Create Account"
                    }
                </button>
            </form>
        </div>
    );
}


function PlanSelectionView() {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleSelectPlan(plan: 'hobby' | 'creator' | 'startup') {
        const supabase = createBrowserClient();
        setLoading(plan);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // If HOBBY (free): Set plan and mark as completed immediately
        if (plan === 'hobby') {
            await supabase.from('profiles').upsert({
                id: user.id,
                plan_tier: 'hobby',
                has_selected_plan: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            window.location.href = '/dashboard';
            return;
        }

        // FOR PAID PLANS: Do NOT set has_selected_plan yet
        // It will be set by Stripe webhook after successful payment
        // Just redirect to checkout
        window.location.href = `/api/checkout?plan=${plan}&setup=true`;
    }

    return (
        <div className="p-6 sm:p-8">
            {/* Header with gradient */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold mb-4">
                    <Sparkles size={14} />
                    WELCOME TO LOOPHOLE
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Choose your plan</h2>
                <p className="text-muted-foreground text-sm">Start free, upgrade anytime. Cancel with one click.</p>
            </div>

            <div className="space-y-3">
                {/* CREATOR - FEATURED/RECOMMENDED */}
                <button
                    onClick={() => handleSelectPlan('creator')}
                    disabled={!!loading}
                    className="w-full relative p-5 rounded-2xl border-2 border-accent bg-gradient-to-br from-accent/20 via-accent/10 to-purple-600/10 hover:from-accent/30 hover:via-accent/15 hover:to-purple-600/15 transition-all text-left group overflow-hidden"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Popular badge */}
                    <div className="absolute -top-px -right-px bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                        MOST POPULAR
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown size={18} className="text-accent" />
                                    <span className="font-bold text-lg">Creator</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">$9</span>
                                    <span className="text-muted-foreground text-sm">/month</span>
                                </div>
                            </div>
                            {loading === 'creator' ? (
                                <Spinner />
                            ) : (
                                <ArrowRight size={20} className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">Perfect for developers who need professional features.</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                '3 Custom subdomains',
                                '3 Concurrent tunnels',
                                'Password protection',
                                'TCP & WebSocket',
                                'Request logging',
                                'Priority support'
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-1.5 text-white/80">
                                    <Check size={12} className="text-accent shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </button>

                {/* STARTUP */}
                <button
                    onClick={() => handleSelectPlan('startup')}
                    disabled={!!loading}
                    className="w-full p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all text-left group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Building size={18} className="text-purple-400" />
                                <span className="font-bold text-lg">Startup</span>
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">TEAMS</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">$29</span>
                                <span className="text-muted-foreground text-sm">/month</span>
                            </div>
                        </div>
                        {loading === 'startup' ? (
                            <Spinner />
                        ) : (
                            <ArrowRight size={20} className="text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">For teams building production applications.</p>

                    <div className="flex flex-wrap gap-2 text-xs">
                        {['5 Team members', '10 Custom subdomains', 'Audit logs', '99.9% SLA'].map((feature) => (
                            <span key={feature} className="bg-white/5 text-white/70 px-2 py-1 rounded">{feature}</span>
                        ))}
                    </div>
                </button>

                {/* Divider */}
                <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-black px-3 text-xs text-muted-foreground">or start free</span>
                    </div>
                </div>

                {/* HOBBY - De-emphasized */}
                <button
                    onClick={() => handleSelectPlan('hobby')}
                    disabled={!!loading}
                    className="w-full p-4 rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.02] hover:border-white/10 transition-all text-left group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <Zap size={14} className="text-muted-foreground" />
                            </div>
                            <div>
                                <div className="font-medium text-sm text-muted-foreground">Hobby</div>
                                <div className="text-xs text-muted-foreground/60">1 tunnel, random subdomain</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Free forever</span>
                            {loading === 'hobby' ? (
                                <Spinner />
                            ) : (
                                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    </div>
                </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-muted-foreground/50">
                <div className="flex items-center gap-1">
                    <Shield size={10} />
                    <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-1">
                    <RefreshCw size={10} />
                    <span>Cancel anytime</span>
                </div>
            </div>
        </div>
    )
}

function Spinner() {
    return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
}

type SettingsTab = 'profile' | 'email' | 'phone' | 'password' | 'security';

function SettingsView() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { closeModal } = useModal();

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'profile', label: 'Profile', icon: <Settings size={16} /> },
        { id: 'email', label: 'Email', icon: <Mail size={16} /> },
        { id: 'phone', label: 'Phone', icon: <Shield size={16} /> },
        { id: 'password', label: 'Password', icon: <Shield size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    ];

    return (
        <div className="max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="text-center p-6 pb-0">
                <h2 className="text-2xl font-bold mb-1">Settings</h2>
                <p className="text-muted-foreground text-sm">Manage your account</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 px-6 pt-4 pb-2 border-b border-white/10 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white/10 text-white'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'email' && <EmailTab />}
                {activeTab === 'phone' && <PhoneTab />}
                {activeTab === 'password' && <PasswordTab />}
                {activeTab === 'security' && <SecurityTab />}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={closeModal}
                    className="w-full h-10 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-all text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function ProfileTab() {
    const supabase = createBrowserClient();
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    setUsername(data.user.username || "");
                    setDisplayName(data.user.display_name || "");
                    setAvatarUrl(data.user.avatar_url || null);
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
            }
        }
        load();
    }, []);

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                setError(uploadError.message);
                setUploading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update both auth metadata and profiles table
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

            setAvatarUrl(publicUrl);
        } catch (err) {
            setError('Avatar upload failed');
        }

        setUploading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update auth metadata
            await supabase.auth.updateUser({ data: { username, full_name: displayName } });

            // Update profiles table
            await supabase.from('profiles').update({
                username,
                display_name: displayName,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError('Failed to save changes');
        }

        setLoading(false);
    }

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-white/10 object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/50 to-purple-600/50 flex items-center justify-center border-2 border-white/10">
                            <span className="text-2xl font-bold text-white">
                                {(displayName || username || "U").charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="text-xs font-bold text-white">Change</span>
                        )}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click to change photo</p>
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm"
                >
                    {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
            </form>
        </div>
    );
}

function EmailTab() {
    const supabase = createBrowserClient();
    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentEmail(user.email);
        }
        load();
    }, [supabase]);

    async function handleChangeEmail(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            }, {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            });

            if (error) {
                setError(error.message);
            } else {
                setSent(true);
            }
        } catch (err) {
            setError('Failed to send confirmation email');
        }

        setLoading(false);
    }

    if (sent) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">Check your inbox</h3>
                <p className="text-muted-foreground text-sm">
                    We sent a confirmation link to <span className="text-white">{newEmail}</span>
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                    You'll also receive a link at your old email to confirm the change.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-1">Current Email</div>
                <div className="text-white font-medium">{currentEmail}</div>
            </div>

            <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">New Email Address</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="newemail@example.com"
                        required
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || !newEmail}
                    className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Change Email"}
                </button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
                You'll need to confirm the change from both your old and new email addresses.
            </p>
        </div>
    );
}

function PhoneTab() {
    const supabase = createBrowserClient();
    const [currentPhone, setCurrentPhone] = useState<string | null>(null);
    const [newPhone, setNewPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<'input' | 'verify'>('input');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.phone) setCurrentPhone(user.phone);
        }
        load();
    }, [supabase]);

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                phone: newPhone
            });

            if (error) {
                setError(error.message);
            } else {
                setStep('verify');
            }
        } catch (err) {
            setError('Failed to send verification code');
        }

        setLoading(false);
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: newPhone,
                token: otp,
                type: 'phone_change'
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setCurrentPhone(newPhone);
                setNewPhone("");
                setOtp("");
                setStep('input');
            }
        } catch (err) {
            setError('Verification failed');
        }

        setLoading(false);
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">Phone Verified!</h3>
                <p className="text-muted-foreground text-sm">Your phone number has been updated.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-accent hover:underline">
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {currentPhone && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Current Phone</div>
                    <div className="text-white font-medium flex items-center gap-2">
                        {currentPhone}
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Verified</span>
                    </div>
                </div>
            )}

            {step === 'input' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-bold uppercase">
                            {currentPhone ? 'New Phone Number' : 'Phone Number'}
                        </label>
                        <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="+1234567890"
                            required
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                    </div>

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !newPhone}
                        className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Verification Code"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                            Enter the code sent to <span className="text-white">{newPhone}</span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-bold uppercase">Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            required
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep('input'); setOtp(""); setError(null); }}
                        className="w-full text-sm text-muted-foreground hover:text-white"
                    >
                        Back
                    </button>
                </form>
            )}
        </div>
    );
}

function PasswordTab() {
    const supabase = createBrowserClient();
    const [hasPassword, setHasPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkProvider() {
            const { data: { user } } = await supabase.auth.getUser();
            // Check if user signed up with email (has password)
            const hasEmailIdentity = user?.identities?.some(i => i.provider === 'email');
            setHasPassword(!!hasEmailIdentity);
        }
        checkProvider();
    }, [supabase]);

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setError('Failed to update password');
        }

        setLoading(false);
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2">Password Updated!</h3>
                <p className="text-muted-foreground text-sm">Your password has been changed successfully.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-accent hover:underline">
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!hasPassword && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-200">
                        You signed in with a social provider. Setting a password will allow you to also log in with email.
                    </p>
                </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">
                        {hasPassword ? 'New Password' : 'Set Password'}
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full h-10 bg-white text-black font-bold rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                >
                    {loading ? "Updating..." : hasPassword ? "Change Password" : "Set Password"}
                </button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
                Password must be at least 8 characters long.
            </p>
        </div>
    );
}

function SecurityTab() {
    const supabase = createBrowserClient();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            // Note: Supabase doesn't expose all sessions via client API
            // We'll show the current session info
            if (session) {
                setSessions([{
                    id: 'current',
                    user_agent: navigator.userAgent,
                    created_at: session.access_token ? 'Current session' : null,
                    current: true
                }]);
            }
        } catch (err) {
            console.error("Failed to load sessions:", err);
        }
        setLoading(false);
    }

    async function handleSignOutEverywhere() {
        setRevoking('all');
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            await supabase.auth.signOut({ scope: 'global' });
            window.location.href = '/';
        } catch (err) {
            console.error("Failed to sign out:", err);
        }
        setRevoking(null);
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold mb-3">Active Sessions</h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div key={session.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-white flex items-center gap-2">
                                            This Device
                                            {session.current && (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Current</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                                            {session.user_agent?.split(' ').slice(0, 3).join(' ') || 'Unknown device'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold mb-3 text-red-400">Danger Zone</h3>
                <button
                    onClick={handleSignOutEverywhere}
                    disabled={revoking === 'all'}
                    className="w-full p-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium disabled:opacity-50"
                >
                    {revoking === 'all' ? 'Signing out...' : 'Sign Out of All Devices'}
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                    This will sign you out of all devices including this one.
                </p>
            </div>
        </div>
    );
}

function BillingView() {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<{
        plan_tier: 'hobby' | 'creator' | 'startup';
        subscription_status: string;
        stripe_subscription_id: string | null;
    } | null>(null);
    const { closeModal } = useModal();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();

                if (data.user) {
                    setProfile({
                        plan_tier: data.user.plan_tier,
                        subscription_status: data.user.subscription_status || 'active',
                        stripe_subscription_id: data.user.stripe_subscription_id || null
                    });
                }
            } catch (err) {
                console.error("Failed to fetch billing profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const currentPlan = profile?.plan_tier || 'hobby';
    const planConfig = PLANS[currentPlan] || PLANS['hobby'];
    const isActive = profile?.subscription_status === 'active' || currentPlan === 'hobby';
    const hasStripeSubscription = !!profile?.stripe_subscription_id;

    async function handleManageBilling() {
        setLoading(true);
        // Redirect to Stripe Customer Portal or billing management
        window.location.href = '/api/billing/portal';
    }

    async function handleUpgrade(plan: 'creator' | 'startup') {
        setLoading(true);
        window.location.href = `/api/checkout?plan=${plan}&setup=true`;
    }

    // Determine which upgrade options to show
    const planRank = { hobby: 0, creator: 1, startup: 2 };
    const showCreatorUpgrade = planRank[currentPlan] < planRank['creator'];
    const showStartupUpgrade = planRank[currentPlan] < planRank['startup'];

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Billing</h2>
                <p className="text-muted-foreground text-sm">Manage your subscription and billing</p>
            </div>

            <div className="space-y-4">
                {/* Current Plan Display */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                Current Plan
                                {currentPlan !== 'hobby' && <Crown size={14} className="text-accent" />}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {planConfig.name} ({planConfig.priceDisplay === '$0' ? 'Free' : planConfig.priceDisplay + '/month'})
                            </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {isActive ? 'Active' : profile?.subscription_status || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Upgrade Options */}
                {(showCreatorUpgrade || showStartupUpgrade) && (
                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-bold uppercase">Upgrade</div>

                        {showCreatorUpgrade && (
                            <button
                                onClick={() => handleUpgrade('creator')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-accent/50 bg-accent/5 hover:bg-accent/10 transition-all text-left disabled:opacity-50"
                            >
                                <div>
                                    <div className="font-bold">{PLANS.creator.name}</div>
                                    <div className="text-xs text-muted-foreground">{PLANS.creator.priceDisplay}/month</div>
                                </div>
                                <CreditCard size={18} className="text-accent" />
                            </button>
                        )}

                        {showStartupUpgrade && (
                            <button
                                onClick={() => handleUpgrade('startup')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-left disabled:opacity-50"
                            >
                                <div>
                                    <div className="font-bold">{PLANS.startup.name}</div>
                                    <div className="text-xs text-muted-foreground">{PLANS.startup.priceDisplay}/month</div>
                                </div>
                                <CreditCard size={18} className="text-muted-foreground" />
                            </button>
                        )}
                    </div>
                )}

                {/* Manage Subscription (for paid plans) */}
                {hasStripeSubscription && (
                    <button
                        onClick={handleManageBilling}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-muted-foreground hover:text-white disabled:opacity-50"
                    >
                        <Settings size={16} />
                        Manage Subscription
                    </button>
                )}

                <button
                    type="button"
                    onClick={closeModal}
                    className="w-full h-10 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-all text-sm mt-4"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
