"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Trash2, AlertTriangle, CheckCircle, Settings } from "lucide-react";

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
      <div className="h-full flex flex-col">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur shrink-0">
             <div className="flex items-center gap-4">
                 <h1 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                     <Settings className="h-5 w-5 text-slate-400" />
                     Settings
                 </h1>
             </div>
          </header>

          <div className="p-6 max-w-2xl mx-auto w-full space-y-8">
              
              {/* Data & Privacy Section */}
              <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">History & Data</h2>
                  
                  <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-orange-500/50">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-400">
                              <AlertTriangle className="h-5 w-5" />
                              Clear History
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                              Remove all "offline" tunnels from your dashboard. Active tunnels will not be affected.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-center gap-4">
                              <Button 
                                variant="destructive" 
                                onClick={handleClearHistory} 
                                disabled={loading}
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 border"
                              >
                                  {loading ? "Cleaning..." : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear Offline Tunnels
                                    </>
                                  )}
                              </Button>

                              {success && (
                                  <div className="flex items-center gap-2 text-emerald-500 text-sm animate-in fade-in slide-in-from-left-2">
                                      <CheckCircle className="h-4 w-4" />
                                      History cleared!
                                  </div>
                              )}
                          </div>
                      </CardContent>
                  </Card>
              </section>

               {/* Account Section - Placeholder for now */}
              <section className="space-y-4 pt-4">
                  <h2 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">Account</h2>
                  <div className="text-sm text-slate-500 p-4 border border-slate-800 rounded bg-slate-900/50">
                      Signed in via Loophole Account. Manage your subscription (Coming Soon).
                  </div>
              </section>

          </div>
      </div>
  );
}
