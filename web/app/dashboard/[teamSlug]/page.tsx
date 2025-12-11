"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Users, Terminal } from "lucide-react";
import { TunnelCard } from "@/components/tunnel-card";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
};

type Team = {
  id: string;
  name: string;
  slug: string;
};

export default function TeamDashboard({ params }: { params: Promise<{ teamSlug: string }> }) {
  const resolvedParams = use(params);
  const { teamSlug } = resolvedParams;

  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
        // 1. Get Team ID from Slug
        const { data: teamData } = await supabase
            .from('teams')
            .select('id, name, slug')
            .eq('slug', teamSlug)
            .single();
        
        if (!teamData) return;
        setTeam(teamData);

        // 2. Fetch Tunnels for this Team
        const { data: tunnelData } = await supabase
            .from('tunnels')
            .select('*')
            .eq('team_id', teamData.id);
        
        if (tunnelData) setTunnels(tunnelData);

        // 3. Subscribe
        const channel = supabase
            .channel(`team-${teamData.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tunnels', filter: `team_id=eq.${teamData.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTunnels((prev) => [...prev, payload.new as Tunnel]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTunnels((prev) => prev.map(t => t.id === payload.new.id ? payload.new as Tunnel : t));
                    } else if (payload.eventType === 'DELETE') {
                        setTunnels((prev) => prev.filter(t => t.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    init();
  }, [teamSlug]);

  if (!team) return <div className="p-10 text-slate-500">Loading Team...</div>;

  return (
      <div className="h-full flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                        {team.name}
                    </h1>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Team Workspace</span>
                </div>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">New Team Tunnel</Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-950 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle>Start a Team Tunnel</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Team tunnels run on your machine but are visible to everyone in the team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-slate-900 rounded border border-slate-800 font-mono text-sm">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Terminal className="h-4 w-4" />
                            <span>CLI Command</span>
                        </div>
                        <div className="text-slate-300">
                            loophole start 3000 --team {team.slug}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
        
        <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tunnels.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-10">
                    No active team tunnels. Start one using the CLI.
                </div>
            )}

            {tunnels.map((tunnel) => (
                <TunnelCard key={tunnel.id} tunnel={tunnel} isOwner={true} />
            ))}
        </div>
      </div>
  );
}
