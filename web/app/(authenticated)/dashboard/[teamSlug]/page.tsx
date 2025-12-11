"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Users, Terminal, Check, Copy } from "lucide-react";
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
  const [copiedCmd, setCopiedCmd] = useState(false);
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
            .eq('team_id', teamData.id)
            .order('last_heartbeat', { ascending: false });
        
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

  if (!team) return <div className="p-10 text-muted-foreground animate-pulse">Loading Team...</div>;

  const handleCopyCmd = () => {
      navigator.clipboard.writeText(`loophole start 3000 --team ${team.slug}`);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
      <div className="h-full flex flex-col bg-background text-foreground">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur shrink-0 sticky top-0 z-10 transition-all">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold flex items-center gap-2 tracking-tight text-foreground">
                        <Users className="h-5 w-5 text-accent" />
                        {team.name}
                    </h1>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Team Workspace</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button variant="outline" asChild size="sm" className="border-border hover:bg-secondary text-foreground">
                    <Link href={`/dashboard/${teamSlug}/settings`}>
                         <Settings className="mr-2 h-4 w-4" /> Team Settings
                    </Link>
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-border hover:bg-secondary text-foreground">
                            New Team Tunnel
                        </Button>
                    </DialogTrigger>
                <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>Start a Team Tunnel</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Team tunnels run on your machine but are visible to everyone in the team.
                        </DialogDescription>
                    </DialogHeader>
                    <div 
                        className="mt-4 p-4 bg-secondary rounded-lg border border-border font-mono text-sm relative group cursor-pointer hover:border-accent/50 transition-colors"
                        onClick={handleCopyCmd}
                    >
                        <div className="flex items-center gap-2 text-accent mb-2">
                            <Terminal className="h-4 w-4" />
                            <span className="text-xs uppercase font-bold tracking-wider">CLI Command</span>
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="text-foreground">
                                loophole start 3000 --team {team.slug}
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground group-hover:text-foreground">
                                {copiedCmd ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                            </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
        
        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tunnels.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/30">
                    <div className="space-y-2">
                         <h3 className="text-lg font-bold text-foreground">No active tunnels</h3>
                         <p className="text-sm text-muted-foreground">Get started by running the CLI command above.</p>
                    </div>
                </div>
            )}

            {tunnels.map((tunnel) => (
                <TunnelCard key={tunnel.id} tunnel={tunnel} isOwner={true} />
            ))}
        </div>
      </div>
  );
}