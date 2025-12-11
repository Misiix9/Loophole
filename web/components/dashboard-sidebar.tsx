"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { CreateTeamDialog } from "@/components/create-team-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Box, Globe, Settings, ChevronLeft, ChevronRight, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from "next/image";

type Team = {
  id: string;
  name: string;
  slug: string;
};

export function DashboardSidebar() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase.from('teams').select('*');
      if (data) setTeams(data);
    };
    fetchTeams();

    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) setIsCollapsed(JSON.parse(savedState));
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const NavItem = ({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) => {
     const ButtonContent = (
        <Button 
            variant="ghost" 
            asChild 
            className={cn(
                "justify-start mb-1 transition-all duration-300", 
                isActive ? "bg-secondary text-foreground border-l-2 border-accent font-medium rounded-none" : "text-muted-foreground hover:text-foreground",
                isCollapsed ? "w-10 h-10 px-0 mx-auto justify-center hover:scale-110" : "w-full px-4 hover:translate-x-1"
            )}
        >
            <Link href={href} className="flex items-center">
                <Icon className={cn("h-4 w-4 shrink-0 transition-all duration-300", isCollapsed ? "h-5 w-5" : "mr-2")} />
                <span 
                    className={cn(
                        "transition-all duration-300 overflow-hidden whitespace-nowrap", 
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}
                >
                    {label}
                </span>
            </Link>
        </Button>
     );

     if (isCollapsed) {
       return (
         <TooltipProvider delayDuration={0}>
           <Tooltip>
             <TooltipTrigger asChild>
               {ButtonContent}
             </TooltipTrigger>
             <TooltipContent side="right">
               {label}
             </TooltipContent>
           </Tooltip>
         </TooltipProvider>
       );
     }
     
     return ButtonContent;
  };

  return (
      <aside className={cn(
          "border-r border-border bg-card flex flex-col transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-64"
      )}>
        {/* Header */}
        <div className={cn("flex items-center h-16 px-4", isCollapsed ? "justify-center" : "justify-between")}>
             <div className="flex items-center gap-2">
                <Image 
                  src="/logo.png" 
                  alt="Loophole" 
                  width={32} 
                  height={32} 
                  className="rounded-lg shadow-lg shadow-accent/20"
                />
                {!isCollapsed && <span className="font-bold text-lg tracking-tight text-foreground">Loophole</span>}
             </div>
             
             {!isCollapsed && (
                 <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                 </Button>
             )}
        </div>

        {/* Collapsed Toggle if closed */}
        {isCollapsed && (
            <div className="px-2 mb-4 flex justify-center">
                 <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-4 w-4" />
                 </Button>
            </div>
        )}
        
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-hidden">
          {/* Main Group */}
          <div className="flex flex-col">
            {!isCollapsed && <div className="px-2 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap transition-opacity duration-300">Platform</div>}
            <NavItem 
                href="/dashboard" 
                icon={Box} 
                label="My Tunnels" 
                isActive={pathname === '/dashboard'} 
            />
            <NavItem 
                href="/community" 
                icon={Globe} 
                label="Community" 
                isActive={pathname === '/community'} 
            />
          </div>

          {/* Teams Group */}
          <div className="flex flex-col">
             {!isCollapsed && (
                 <div className="px-2 mb-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap transition-opacity duration-300">
                    Teams
                 </div>
             )}

             {/* Create Team Button - positioned here for both states */}
             <div className="mb-2">
                <CreateTeamDialog onTeamCreated={() => window.location.reload()}>
                    {isCollapsed ? (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 mx-auto text-muted-foreground hover:bg-secondary hover:text-foreground mb-1 flex justify-center items-center"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs border-dashed gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border">
                            <Plus className="h-3 w-3" /> Create Team
                        </Button>
                    )}
                </CreateTeamDialog>
             </div>
             
             <div className="space-y-1 flex flex-col">
                {teams.map(team => (
                    <NavItem 
                        key={team.id}
                        href={`/dashboard/${team.slug}`}
                        icon={Users}
                        label={team.name}
                        isActive={pathname === `/dashboard/${team.slug}`}
                    />
                ))}
             </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border mt-auto flex flex-col">
             <NavItem 
                href="/dashboard/settings" 
                icon={Settings} 
                label="Settings" 
                isActive={pathname === '/dashboard/settings'} 
            />
        </div>
      </aside>
  );
}
