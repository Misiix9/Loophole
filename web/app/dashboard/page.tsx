"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedTunnelsList } from "@/components/shared-tunnels-list";
import { TunnelCard } from "@/components/tunnel-card";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
};

export default function Dashboard() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const supabase = createClient();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [userId, setUserId] = useState<string>('Initializing...');
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [showOffline, setShowOffline] = useState(false);

  const fetchTunnels = async () => {
    // Filter for Personal Tunnels (where team_id is null)
    const { data, error } = await supabase.from('tunnels').select('*');
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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.log("No user session found");
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

  return (
      <div className="h-full flex flex-col">
          <Tabs defaultValue="personal" className="h-full flex flex-col">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                     <TabsList className="bg-slate-800 border-slate-700">
                        <TabsTrigger value="personal">My Tunnels</TabsTrigger>
                        <TabsTrigger value="shared">Shared with Me</TabsTrigger>
                    </TabsList>
                </div>
                
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-400 flex items-center gap-2 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={showOffline}
                            onChange={(e) => setShowOffline(e.target.checked)}
                            className="accent-emerald-500 w-4 h-4 rounded border-slate-700 bg-slate-900"
                        />
                        Show Offline
                    </label>
                </div>
            </header>
            
            <div className="flex-1 overflow-auto p-6">
                {errorMsg && (
                    <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg">
                        <strong>Error fetching tunnels:</strong> {errorMsg}
                    </div>
                )}


                <TabsContent value="personal" className="mt-0 space-y-6">
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {displayedTunnels.length === 0 && (
                            <div className="col-span-full text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
                                {showOffline 
                                    ? <span>No tunnels found at all. Start one with <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">loophole start</code></span>
                                    : <span>No active tunnels. Check "Show Offline" to see history.</span>
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
