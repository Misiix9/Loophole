"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedTunnelsList } from "@/components/shared-tunnels-list";
import { TunnelCard } from "@/components/tunnel-card";
import { Button } from "@/components/ui/button";
import { Link, Copy, Check, Terminal, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
  last_heartbeat?: string;
  team_id?: string;
};

export default function Dashboard() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const supabase = createClient();
  const router = useRouter();
  
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [userId, setUserId] = useState<string>('Initializing...');
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showOffline, setShowOffline] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchTunnels = async () => {
    // Filter for Personal Tunnels (where team_id is null)
    const { data, error } = await supabase.from('tunnels').select('*').order('last_heartbeat', { ascending: false });
    if (error) {
        console.error('Fetch tunnels error:', error);
        setErrorMsg(error.message);
    }
    if (data) {
        setTunnels(data);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        setUserId('NOT_LOGGED_IN');
      }
    };
    fetchUser();
    fetchTunnels();
  }, []);

  // Filtered tunnels
  const displayedTunnels = showOffline 
    ? tunnels 
    : tunnels.filter(t => t.status === 'online');
    
  // Handle empty state CLI copy
  const handleCopyCmd = () => {
      navigator.clipboard.writeText("loophole start 3000");
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
      <div className="h-full flex flex-col bg-background text-foreground">
          <Tabs defaultValue="personal" className="h-full flex flex-col">
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-foreground">My</span> <span className="text-accent">Workspace</span>
                    </h1>
                     <TabsList className="bg-secondary/50 border border-border/50">
                        <TabsTrigger value="personal" className="data-[state=active]:bg-accent data-[state=active]:text-white">Personal</TabsTrigger>
                        <TabsTrigger value="shared" className="data-[state=active]:bg-accent data-[state=active]:text-white">Shared</TabsTrigger>
                    </TabsList>
                </div>
                
                <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowOffline(!showOffline)}
                        className="group flex items-center gap-2 cursor-pointer outline-none"
                    >
                        <span className={`text-xs font-mono font-medium transition-colors duration-300 ${showOffline ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`}>
                            HISTORY
                        </span>
                        <div className={`w-9 h-5 rounded-full p-1 transition-colors duration-300 flex items-center ${showOffline ? "bg-accent" : "bg-secondary border border-border"}`}>
                            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${showOffline ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                    </button>
                </div>
                </div>
            </header>
            
            <div className="flex-1 overflow-auto p-6">
                {errorMsg && (
                    <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> 
                        <span>{errorMsg}</span>
                    </div>
                )}


                <TabsContent value="personal" className="mt-0 space-y-6">
                     <div key={showOffline ? 'history' : 'active'} className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards">
                        {displayedTunnels.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/30">
                                {showOffline 
                                    ? (
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground">No tunnels found in history.</p>
                                        </div>
                                      )
                                    : (
                                        <div className="max-w-md space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-foreground">Start your first tunnel</h3>
                                                <p className="text-sm text-muted-foreground">Run this command in your terminal to expose port 3000.</p>
                                            </div>
                                            
                                            <div 
                                                className="flex items-center justify-between gap-4 p-3 bg-black/50 border border-border rounded-lg font-mono text-sm group cursor-pointer hover:border-accent/50 transition-colors relative"
                                                onClick={handleCopyCmd}
                                            >
                                                <span className="text-emerald-400 pl-2">$ <span className="text-white">loophole start 3000</span></span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground group-hover:text-white">
                                                    {copiedCmd ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-center gap-4 pt-2">
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest">OR</span>
                                            </div>

                                            <Button 
                                                variant="outline" 
                                                className="w-full border-border bg-secondary/50 hover:bg-secondary hover:text-white gap-2"
                                                onClick={() => router.push('/community')}
                                            >
                                                <Globe className="h-4 w-4" /> Discover Public Tunnels
                                            </Button>
                                        </div>
                                      )
                                }
                            </div>
                        )}

                        {displayedTunnels.map((tunnel) => (
                            <TunnelCard key={tunnel.id} tunnel={tunnel} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="shared" className="mt-0">
                    <SharedTunnelsList />
                </TabsContent>
            </div>
          </Tabs>
      </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
