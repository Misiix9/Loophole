"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Trash2, AlertTriangle, CheckCircle, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, CreditCard, LayoutDashboard } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This will remove all tunnels that are currently 'offline'. This action cannot be undone.")) {
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

          <div className="p-6 max-w-4xl mx-auto w-full">
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 outline-none">
                     <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-medium">History & Data</h2>
                            <p className="text-sm text-muted-foreground">Manage your local data and tunnel history.</p>
                        </div>
                        
                        <Card className="bg-card border-border border-l-4 border-l-orange-500/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-400 text-base">
                                    <AlertTriangle className="h-5 w-5" />
                                    Clear History
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Remove all "offline" tunnels from your dashboard. Active tunnels will not be affected.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Button 
                                      variant="destructive" 
                                      onClick={handleClearHistory} 
                                      disabled={loading}
                                      className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 border transition-all hover:scale-105 active:scale-95 duration-200"
                                    >
                                        {loading ? "Cleaning..." : (
                                          <>
                                              <Trash2 className="mr-2 h-4 w-4" /> Clear Offline Tunnels
                                          </>
                                        )}
                                    </Button>

                                    {success && (
                                        <div className="flex items-center gap-2 text-success text-sm animate-in fade-in slide-in-from-left-2 font-medium">
                                            <CheckCircle className="h-4 w-4" />
                                            History cleared!
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>

                <TabsContent value="account" className="space-y-6 outline-none">
                     <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-medium">Profile</h2>
                            <p className="text-sm text-muted-foreground">Manage your personal information.</p>
                        </div>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 mb-6">
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

                                <div className="grid gap-4 max-w-sm">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <div className="p-2 rounded-md border border-input bg-muted/50 text-muted-foreground text-sm">
                                            {userProfile?.email || 'Loading...'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">User ID</label>
                                        <div className="p-2 rounded-md border border-input bg-muted/50 text-muted-foreground text-xs font-mono">
                                            {userProfile?.id || 'Loading...'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-6 outline-none">
                    <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-medium">Subscription</h2>
                            <p className="text-sm text-muted-foreground">Manage your plan and billing details.</p>
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
                                    <Button className="bg-foreground text-background hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all">
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>
            </Tabs>
          </div>
      </div>
  );
}
