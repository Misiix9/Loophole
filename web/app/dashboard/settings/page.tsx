"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Trash2, AlertTriangle, CheckCircle, Settings, User } from "lucide-react";

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
      <div className="h-full flex flex-col bg-background text-foreground">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur shrink-0 sticky top-0 z-10">
             <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold flex items-center gap-2 text-foreground tracking-tight">
                     <Settings className="h-5 w-5 text-accent" />
                     Settings
                 </h1>
             </div>
          </header>

          <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
              
              {/* Data & Privacy Section */}
              <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> History & Data
                  </h2>
                  
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

               {/* Account Section */}
              <section className="space-y-4 pt-4">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Account
                  </h2>
                  <div className="text-sm text-muted-foreground p-4 border border-border rounded-lg bg-secondary/20 flex flex-col gap-2">
                      <span className="font-semibold text-foreground">Subscription Status</span>
                      <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          Free Tier (Unlimited Public Tunnels)
                      </div>
                      <p className="text-xs opacity-70 mt-2">
                          Upgrade to Pro (Coming Soon) for static subdomains and team management.
                      </p>
                  </div>
              </section>

          </div>
      </div>
  );
}
