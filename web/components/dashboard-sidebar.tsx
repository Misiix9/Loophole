"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { CreateTeamDialog } from "@/components/create-team-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Box, Globe, Settings } from "lucide-react";

type Team = {
  id: string;
  name: string;
  slug: string;
};

export function DashboardSidebar() {
  const [teams, setTeams] = useState<Team[]>([]);
  const pathname = usePathname();
  const supabase = createClient();

  const fetchTeams = async () => {
     // For Phase 4, simplified fetching. 
     // In real app, RLS handles "my teams" filtering automatically.
     const { data } = await supabase.from('teams').select('*');
     if (data) setTeams(data);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4 hidden md:block flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-slate-900">L</div>
          <span className="font-bold text-lg">Loophole</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <div className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Personal</div>
          <Button variant="ghost" asChild className={`w-full justify-start ${pathname === '/dashboard' ? 'bg-emerald-500/10 text-emerald-500 font-medium' : 'text-slate-400'}`}>
            <Link href="/dashboard">
                <Box className="mr-2 h-4 w-4" /> My Tunnels
            </Link>
          </Button>
          <Button variant="ghost" asChild className={`w-full justify-start ${pathname === '/community' ? 'bg-emerald-500/10 text-emerald-500 font-medium' : 'text-slate-400'}`}>
            <Link href="/community">
                <Globe className="mr-2 h-4 w-4" /> Community
            </Link>
          </Button>

          <div className="px-2 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Teams</span>
          </div>
          
          <div className="space-y-1">
            {teams.map(team => (
                <Button 
                    key={team.id} 
                    variant="ghost" 
                    asChild 
                    className={`w-full justify-start ${pathname === `/dashboard/${team.slug}` ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-slate-400'}`}
                >
                    <Link href={`/dashboard/${team.slug}`}>
                        <Users className="mr-2 h-4 w-4" /> {team.name}
                    </Link>
                </Button>
            ))}
          </div>
          
          <div className="pt-2">
             <CreateTeamDialog onTeamCreated={fetchTeams} />
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-4 px-2">
             <Button variant="ghost" asChild className={`w-full justify-start ${pathname === '/dashboard/settings' ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}>
                <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
             </Button>
        </div>
      </aside>
  );
}
