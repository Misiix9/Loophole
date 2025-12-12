'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Shield, Crown, Ban, Trash2, ArrowLeft,
    Loader2, Search, ChevronDown, Check, X, RefreshCw,
    Mail, Phone, Calendar, Clock
} from 'lucide-react';
import Image from 'next/image';

interface User {
    id: string;
    email: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    plan_tier: string;
    is_admin: boolean;
    subscription_status: string;
    created_at: string;
    last_sign_in_at: string | null;
    banned_until: string | null;
    phone: string | null;
    phone_confirmed: boolean;
    email_confirmed: boolean;
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    async function checkAdminAndLoad() {
        try {
            // Check if current user is admin
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();

            console.log('Admin check - API response:', meData);
            console.log('Admin check - is_admin value:', meData.user?.is_admin);

            if (!meData.user?.is_admin) {
                console.log('Admin check failed - redirecting to /');
                router.push('/');
                return;
            }

            setIsAdmin(true);
            await loadUsers();
        } catch (err) {
            console.error('Admin check failed:', err);
            router.push('/');
        }
    }

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setUsers(data.users || []);
        } catch (err) {
            console.error('Failed to load users:', err);
            setMessage({ type: 'error', text: 'Failed to load users' });
        }
        setLoading(false);
    }

    async function handleAction(action: string, userId: string, params: Record<string, any> = {}) {
        setActionLoading(`${action}-${userId}`);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userId, ...params })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessage({ type: 'success', text: data.message });
            await loadUsers(); // Refresh
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Action failed' });
        }

        setActionLoading(null);
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: users.length,
        admins: users.filter(u => u.is_admin).length,
        banned: users.filter(u => u.banned_until).length,
        creators: users.filter(u => u.plan_tier === 'creator').length,
        startups: users.filter(u => u.plan_tier === 'startup').length,
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Admin Panel</h1>
                                <p className="text-xs text-muted-foreground">User Management</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Users</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-red-400">{stats.admins}</div>
                        <div className="text-xs text-muted-foreground">Admins</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-amber-400">{stats.banned}</div>
                        <div className="text-xs text-muted-foreground">Banned</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-purple-400">{stats.creators}</div>
                        <div className="text-xs text-muted-foreground">Creator Plans</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-400">{stats.startups}</div>
                        <div className="text-xs text-muted-foreground">Startup Plans</div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                        {message.text}
                        <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by email, username, or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Plan</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Joined</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <UserRow
                                            key={user.id}
                                            user={user}
                                            onAction={handleAction}
                                            actionLoading={actionLoading}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

function UserRow({ user, onAction, actionLoading }: {
    user: User;
    onAction: (action: string, userId: string, params?: any) => void;
    actionLoading: string | null;
}) {
    const [showActions, setShowActions] = useState(false);
    const isBanned = user.banned_until && new Date(user.banned_until) > new Date();

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-bold">
                                {(user.display_name || user.username || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <div className="font-medium flex items-center gap-2">
                            {user.display_name || user.username || 'No name'}
                            {user.is_admin && (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Admin</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                    {isBanned ? (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded inline-flex items-center gap-1 w-fit">
                            <Ban size={12} /> Banned
                        </span>
                    ) : (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded w-fit">Active</span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {user.email_confirmed && <span className="flex items-center gap-1"><Mail size={10} /> ✓</span>}
                        {user.phone_confirmed && <span className="flex items-center gap-1"><Phone size={10} /> ✓</span>}
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <PlanDropdown
                    currentPlan={user.plan_tier}
                    onSelect={(plan) => onAction('update_plan', user.id, { plan_tier: plan })}
                    loading={actionLoading === `update_plan-${user.id}`}
                />
            </td>
            <td className="px-4 py-4">
                <div className="text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </div>
                <div className="text-xs text-muted-foreground">
                    {user.last_sign_in_at ? `Last seen: ${new Date(user.last_sign_in_at).toLocaleDateString()}` : 'Never signed in'}
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronDown size={16} />
                    </button>

                    {showActions && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-white/10 rounded-xl p-1 shadow-2xl z-50">
                                {!user.is_admin && (
                                    <button
                                        onClick={() => { onAction('toggle_admin', user.id, { is_admin: true }); setShowActions(false); }}
                                        disabled={actionLoading === `toggle_admin-${user.id}`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Shield size={14} /> Make Admin
                                    </button>
                                )}
                                {user.is_admin && (
                                    <button
                                        onClick={() => { onAction('toggle_admin', user.id, { is_admin: false }); setShowActions(false); }}
                                        disabled={actionLoading === `toggle_admin-${user.id}`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Shield size={14} /> Revoke Admin
                                    </button>
                                )}
                                <div className="h-px bg-white/10 my-1" />
                                {isBanned ? (
                                    <button
                                        onClick={() => { onAction('unban', user.id); setShowActions(false); }}
                                        disabled={actionLoading === `unban-${user.id}`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    >
                                        <Check size={14} /> Unban User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { onAction('ban', user.id); setShowActions(false); }}
                                        disabled={actionLoading === `ban-${user.id}`}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                    >
                                        <Ban size={14} /> Ban User
                                    </button>
                                )}
                                <div className="h-px bg-white/10 my-1" />
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                                            onAction('delete', user.id);
                                            setShowActions(false);
                                        }
                                    }}
                                    disabled={actionLoading === `delete-${user.id}`}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

function PlanDropdown({ currentPlan, onSelect, loading }: {
    currentPlan: string;
    onSelect: (plan: string) => void;
    loading: boolean;
}) {
    const [open, setOpen] = useState(false);

    const plans = [
        { id: 'hobby', label: 'Hobby', color: 'text-gray-400' },
        { id: 'creator', label: 'Creator', color: 'text-purple-400' },
        { id: 'startup', label: 'Startup', color: 'text-emerald-400' },
    ];

    const current = plans.find(p => p.id === currentPlan) || plans[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm ${current.color} hover:bg-white/10 transition-colors`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                {current.label}
                <ChevronDown size={14} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-32 bg-black border border-white/10 rounded-xl p-1 shadow-2xl z-50">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => { onSelect(plan.id); setOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors ${plan.color} hover:bg-white/10 ${currentPlan === plan.id ? 'bg-white/10' : ''}`}
                            >
                                {currentPlan === plan.id && <Check size={14} />}
                                {plan.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
