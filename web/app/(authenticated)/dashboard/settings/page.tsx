"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { Trash2, AlertTriangle, CheckCircle, Settings, Moon, Sun, Key, UserX, Save, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile(user as UserProfile);
        setDisplayName(user.user_metadata?.full_name || "");
      }
    };
    getUser();
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme !== 'light');
  }, []);

  // Clear History Handler
  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This will remove all tunnels that are currently offline. This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('tunnels')
      .delete()
      .eq('status', 'offline');

    setLoading(false);
    if (error) {
      alert("Error clearing history: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Update Display Name Handler
  const handleUpdateName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    
    // Update auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: displayName }
    });

    // Also update profiles table
    if (!authError && userProfile) {
      await supabase
        .from('profiles')
        .upsert({ 
          id: userProfile.id, 
          display_name: displayName,
          email: userProfile.email 
        });
    }

    setSavingName(false);
    if (authError) {
      alert("Error updating name: " + authError.message);
    } else {
      alert("Display name updated successfully!");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserProfile(user as UserProfile);
    }
  };

  // Change Password Handler
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setSavingPassword(false);
    if (error) {
      alert("Error changing password: " + error.message);
    } else {
      alert("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Delete Account Handler - Uses API route
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== userProfile?.email) {
      alert("Please type your email correctly to confirm deletion.");
      return;
    }

    if (!confirm("FINAL WARNING: This will permanently delete your account and all associated data. Are you absolutely sure?")) {
      return;
    }

    setDeleting(true);
    
    try {
      const response = await fetch('/api/admin/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/");
    } catch (error: any) {
      alert("Error deleting account: " + error.message);
      setDeleting(false);
    }
  };

  // Theme Toggle Handler
  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    document.documentElement.classList.toggle('light', !checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground animate-in fade-in duration-500">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2 text-foreground tracking-tight">
            <Settings className="h-5 w-5 text-accent" />
            Settings
          </h1>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto w-full overflow-y-auto">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6 outline-none">
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the look and feel.</p>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-accent/10 rounded-full">
                        {darkMode ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
                      </div>
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                      </div>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">History & Data</h2>
                <p className="text-sm text-muted-foreground">Manage your tunnel history.</p>
              </div>
              
              <Card className="border-l-4 border-l-orange-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400 text-base">
                    <AlertTriangle className="h-5 w-5" />
                    Clear History
                  </CardTitle>
                  <CardDescription>
                    Remove all offline tunnels from your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="destructive" 
                      onClick={handleClearHistory} 
                      disabled={loading}
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 border"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Clear Offline Tunnels
                    </Button>
                    {success && (
                      <div className="flex items-center gap-2 text-success text-sm animate-in fade-in font-medium">
                        <CheckCircle className="h-4 w-4" />
                        History cleared!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="space-y-6 outline-none">
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Profile</h2>
                <p className="text-sm text-muted-foreground">Manage your personal information.</p>
              </div>
              
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-border">
                      <AvatarImage src={userProfile?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-lg bg-secondary text-foreground">
                        {userProfile?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{userProfile?.user_metadata?.full_name || 'User'}</h3>
                      <p className="text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                        />
                        <Button onClick={handleUpdateName} disabled={savingName}>
                          {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="p-2 rounded-md border border-input bg-muted/50 text-muted-foreground text-sm">
                        {userProfile?.email || 'Loading...'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <div className="p-2 rounded-md border border-input bg-muted/50 text-muted-foreground text-xs font-mono">
                        {userProfile?.id || 'Loading...'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Security</h2>
                <p className="text-sm text-muted-foreground">Update your password.</p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Key className="h-5 w-5 text-accent" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword}>
                      {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">Irreversible and destructive actions.</p>
              </div>
              
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive text-base">
                    <UserX className="h-5 w-5" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirm">
                        Type your email to confirm: <span className="font-mono text-destructive">{userProfile?.email}</span>
                      </Label>
                      <Input 
                        id="deleteConfirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="your@email.com"
                        className="border-destructive/30"
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== userProfile?.email || deleting}
                    >
                      {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* BILLING TAB */}
          <TabsContent value="billing" className="space-y-6 outline-none">
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Subscription</h2>
                <p className="text-sm text-muted-foreground">Manage your plan and billing.</p>
              </div>

              <Card className="bg-gradient-to-br from-card to-accent/5 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    You are currently on the <strong className="text-foreground">Free Tier</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Unlimited Tunnels
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Community Support
                      </div>
                    </div>
                    <Button className="bg-accent hover:bg-accent/90 text-white font-bold shadow-lg">
                      Upgrade to Pro
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Pro Features</CardTitle>
                  <CardDescription>Unlock these features with Pro:</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Custom Domains
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Priority Support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Advanced Analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Team Collaboration
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
