"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { CreateTeamDialog } from "@/components/create-team-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Box, Globe, Settings, ChevronLeft, ChevronRight, LogOut, Plus, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from "next/image";
import { useSidebar } from "@/components/sidebar-provider";
import { User } from "@supabase/supabase-js";
import { PLANS, PlanTier } from "@/lib/plans";

type Team = {
  id: string;
  name: string;
  slug: string;
};

type Profile = {
  id: string;
  plan_tier: PlanTier;
  display_name: string | null;
  avatar_url: string | null;
};

export function DashboardSidebar() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch teams
      const { data: teamsData } = await supabase.from('teams').select('*');
      if (teamsData) setTeams(teamsData);

      // Fetch user and profile
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, plan_tier, display_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);
      }
    };
    fetchData();
  }, []);

  const currentPlan = profile?.plan_tier || 'hobby';
  const currentPlanConfig = PLANS[currentPlan] || PLANS['hobby'];

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

  const handleSignOut = async () => {
    const client = createClient();
    await client.auth.signOut();
    window.location.href = '/';
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

      {/* Footer with User Profile */}
      <div className="p-3 border-t border-border mt-auto flex flex-col gap-2">
        {/* User Profile Section */}
        {user && (
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-secondary/50 mb-2",
            isCollapsed && "justify-center p-1"
          )}>
            {/* Avatar */}
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center border border-white/10">
                          <span className="text-xs font-bold text-white">
                            {(user.user_metadata?.full_name || user.email?.charAt(0) || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {currentPlan !== 'hobby' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                          <Crown size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-sm font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                    <div className="text-xs text-muted-foreground">{currentPlanConfig.name}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <div className="relative shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center border border-white/10">
                      <span className="text-sm font-bold text-white">
                        {(user.user_metadata?.full_name || user.email?.charAt(0) || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-accent flex items-center gap-1">
                    {currentPlan !== 'hobby' && <Crown size={10} />}
                    {currentPlanConfig.name}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <NavItem
          href="/dashboard/settings"
          icon={Settings}
          label="Settings"
          isActive={pathname === '/dashboard/settings'}
        />

        {/* Sign Out Button */}
        {!isCollapsed ? (
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start px-4 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="w-10 h-10 mx-auto text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}
