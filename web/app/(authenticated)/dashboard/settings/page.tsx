"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Terminal,
  Key,
  Trash2,
  Save,
  Loader2,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Link2,
  Zap,
  Clock,
  Server
} from "lucide-react";
import Link from "next/link";

type UserProfile = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile states
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Security states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [apiKey, setApiKey] = useState("lh_xxxx...xxxx");
  const [showApiKey, setShowApiKey] = useState(false);

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tunnelAlerts, setTunnelAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Tunnel defaults states
  const [defaultSubdomain, setDefaultSubdomain] = useState("");
  const [defaultPort, setDefaultPort] = useState("3000");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [keepAlive, setKeepAlive] = useState(true);
  const [requestLogging, setRequestLogging] = useState(true);
  const [tunnelTimeout, setTunnelTimeout] = useState("60");

  // Danger zone states
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile(user as UserProfile);
        setUsername(user.user_metadata?.username || "");
        setDisplayName(user.user_metadata?.full_name || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);

    const { error } = await supabase.auth.updateUser({
      data: { username, full_name: displayName }
    });

    if (!error && userProfile) {
      await supabase.from('profiles').upsert({
        id: userProfile.id,
        email: userProfile.email,
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });
    }

    setSavingProfile(false);
    if (!error) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleRegenerateApiKey = () => {
    const newKey = "lh_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    alert("New API key generated! Make sure to save it.");
  };

  const handleClearHistory = async () => {
    if (!confirm("This will delete all offline tunnels. Continue?")) return;

    setClearingHistory(true);
    await supabase.from('tunnels').delete().eq('status', 'offline');
    setClearingHistory(false);
    alert("History cleared!");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== userProfile?.email) {
      alert("Please type your email correctly.");
      return;
    }
    if (!confirm("FINAL WARNING: This will permanently delete your account. Are you sure?")) {
      return;
    }

    setDeleting(true);
    try {
      await fetch('/api/admin/delete-account', { method: 'POST' });
      await supabase.auth.signOut();
      router.push("/");
    } catch (error: any) {
      alert("Error: " + error.message);
      setDeleting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "tunnels", label: "Tunnel Defaults", icon: Terminal },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                    } ${tab.id === "danger" ? "text-red-400 hover:text-red-300" : ""}`}
                >
                  <tab.icon className={`w-5 h-5 ${tab.id === "danger" && activeTab !== tab.id ? "text-red-400" : ""}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Profile</h2>
                  <p className="text-muted-foreground">Manage your personal information and how others see you.</p>
                </div>

                {/* Avatar */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-white/10 object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center border-2 border-white/10">
                          <span className="text-3xl font-bold">{(displayName || username || "U").charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-xs font-bold">Change</span>
                      </label>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>
                    <div>
                      <p className="font-medium">Upload a new photo</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Basic Information</h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="your-username"
                      />
                      <p className="text-xs text-muted-foreground">This will be your subdomain: {username || "username"}.loophole.app</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="h-11 bg-black/30 border border-white/5 rounded-xl px-4 flex items-center text-muted-foreground">
                        {userProfile?.email}
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">User ID</label>
                      <div className="h-11 bg-black/30 border border-white/5 rounded-xl px-4 flex items-center text-muted-foreground font-mono text-sm">
                        {userProfile?.id?.slice(0, 8)}...{userProfile?.id?.slice(-8)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="h-11 px-6 bg-accent text-black font-bold rounded-xl flex items-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {profileSaved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Security</h2>
                  <p className="text-muted-foreground">Manage your password and API keys.</p>
                </div>

                {/* Password */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Key className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                    </div>
                  </div>

                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 pr-12 text-white focus:outline-none focus:border-accent transition-colors"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword || !newPassword}
                      className="h-11 px-6 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 w-fit"
                    >
                      {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </div>

                {/* API Key */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Terminal className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">API Key</h3>
                      <p className="text-sm text-muted-foreground">Use this key to authenticate CLI and API requests</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 h-11 bg-black/50 border border-white/10 rounded-xl px-4 flex items-center font-mono text-sm">
                      {showApiKey ? apiKey : "lh_" + "•".repeat(32)}
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-11 px-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(apiKey)}
                      className="h-11 px-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRegenerateApiKey}
                      className="h-11 px-4 bg-accent/10 text-accent border border-accent/30 rounded-xl hover:bg-accent/20 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                  <p className="text-muted-foreground">Choose what notifications you receive.</p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Email Notifications</h3>

                  {[
                    { id: "emailNotifications", label: "Email Notifications", desc: "Receive important account updates", value: emailNotifications, setter: setEmailNotifications },
                    { id: "tunnelAlerts", label: "Tunnel Status Alerts", desc: "Get notified when tunnels go offline", value: tunnelAlerts, setter: setTunnelAlerts },
                    { id: "weeklyReport", label: "Weekly Usage Report", desc: "Receive a summary of your tunnel usage", value: weeklyReport, setter: setWeeklyReport },
                    { id: "marketingEmails", label: "Product Updates", desc: "News about new features and improvements", value: marketingEmails, setter: setMarketingEmails },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={`w-12 h-7 rounded-full transition-colors relative ${item.value ? "bg-accent" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${item.value ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tunnel Defaults Tab */}
            {activeTab === "tunnels" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Tunnel Defaults</h2>
                  <p className="text-muted-foreground">Configure default settings for new tunnels.</p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Connection Settings</h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-accent" />
                        Default Subdomain
                      </label>
                      <input
                        type="text"
                        value={defaultSubdomain}
                        onChange={(e) => setDefaultSubdomain(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="my-app"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for random subdomain</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Server className="w-4 h-4 text-accent" />
                        Default Local Port
                      </label>
                      <input
                        type="number"
                        value={defaultPort}
                        onChange={(e) => setDefaultPort(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="3000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        Tunnel Timeout (minutes)
                      </label>
                      <select
                        value={tunnelTimeout}
                        onChange={(e) => setTunnelTimeout(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent transition-colors"
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                        <option value="0">Never (Pro only)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground">Behavior</h3>

                  {[
                    { id: "autoReconnect", label: "Auto Reconnect", desc: "Automatically reconnect when connection drops", icon: RefreshCw, value: autoReconnect, setter: setAutoReconnect },
                    { id: "keepAlive", label: "Keep Alive", desc: "Send periodic pings to keep connection active", icon: Zap, value: keepAlive, setter: setKeepAlive },
                    { id: "requestLogging", label: "Request Logging", desc: "Log all incoming requests to tunnel", icon: Terminal, value: requestLogging, setter: setRequestLogging },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <item.icon className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={`w-12 h-7 rounded-full transition-colors relative ${item.value ? "bg-accent" : "bg-white/10"}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${item.value ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Billing</h2>
                  <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
                </div>

                <div className="p-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-purple-600/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">Current Plan</h3>
                        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">FREE</span>
                      </div>
                      <p className="text-muted-foreground text-sm">You're on the Hobby plan</p>
                    </div>
                    <button className="h-11 px-6 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { name: "Hobby", price: "$0", features: ["1 Tunnel", "Random subdomain", "Community support"] },
                    { name: "Creator", price: "$9", features: ["5 Tunnels", "3 Custom subdomains", "Priority support", "Request logging"], popular: true },
                    { name: "Startup", price: "$29", features: ["Unlimited Tunnels", "10 Custom subdomains", "Team collaboration", "Advanced analytics"] },
                  ].map((plan) => (
                    <div key={plan.name} className={`p-6 rounded-2xl border ${plan.popular ? "border-accent bg-accent/5" : "border-white/10 bg-white/5"}`}>
                      {plan.popular && <span className="text-xs bg-accent text-black px-2 py-0.5 rounded-full font-bold mb-2 inline-block">POPULAR</span>}
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-400">Danger Zone</h2>
                  <p className="text-muted-foreground">Irreversible and destructive actions.</p>
                </div>

                <div className="p-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <div>
                      <h3 className="font-medium">Clear Tunnel History</h3>
                      <p className="text-sm text-muted-foreground">Remove all offline tunnels from your dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    disabled={clearingHistory}
                    className="h-11 px-6 bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold rounded-xl flex items-center gap-2 hover:bg-orange-500/20 transition-colors"
                  >
                    {clearingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Clear History
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div>
                      <h3 className="font-medium text-red-400">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type your email to confirm: <span className="text-red-400 font-mono">{userProfile?.email}</span></label>
                      <input
                        type="email"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="w-full h-11 bg-black/50 border border-red-500/30 rounded-xl px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== userProfile?.email || deleting}
                      className="h-11 px-6 bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
