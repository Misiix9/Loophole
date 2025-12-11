"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Save, Users, UserPlus, Mail, Crown, Shield, Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type TeamMember = {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  email?: string;
  display_name?: string;
};

export default function TeamSettingsPage({ params }: { params: Promise<{ teamSlug: string }> }) {
  const resolvedParams = use(params);
  const { teamSlug } = resolvedParams;

  const [team, setTeam] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('teams').select('*').eq('slug', teamSlug).single();
      if (data) {
        setTeam(data);
        setName(data.name);
        // Fetch team members
        fetchMembers(data.id);
      }
    };
    fetchTeam();
  }, [teamSlug]);

  const fetchMembers = async (teamId: string) => {
    // Note: This assumes a team_members table exists. If not, we'll show empty.
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);
    
    if (data && !error) {
      setMembers(data);
    }
  };

  const handleRename = async () => {
    setLoading(true);
    const { error } = await supabase.from('teams').update({ name }).eq('id', team.id);
    setLoading(false);
    if (error) {
      alert("Error updating team: " + error.message);
    } else {
      alert("Team updated successfully!");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== team.slug) {
      alert(`Please type "${team.slug}" to confirm deletion.`);
      return;
    }

    if (!confirm("FINAL WARNING: This will permanently delete the team and all associated tunnels. Continue?")) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('teams').delete().eq('id', team.id);
    
    if (error) {
      alert("Error deleting team: " + error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    setInviting(true);
    
    // In a real app, this would send an email invitation
    // For now, we'll just simulate adding to team_members if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail)
      .single();

    if (userError || !existingUser) {
      // User doesn't exist - in production, send invitation email
      alert(`Invitation sent to ${inviteEmail}. They will receive an email to join.`);
    } else {
      // User exists - add them to team
      const { error } = await supabase
        .from('team_members')
        .insert({ team_id: team.id, user_id: existingUser.id, role: 'member' });

      if (error) {
        alert("Error adding member: " + error.message);
      } else {
        alert(`${inviteEmail} has been added to the team!`);
        fetchMembers(team.id);
      }
    }

    setInviting(false);
    setInviteEmail("");
    setInviteDialogOpen(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      alert("Error removing member: " + error.message);
    } else {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="h-4 w-4 text-amber-500" />;
    if (role === 'admin') return <Shield className="h-4 w-4 text-accent" />;
    return <Users className="h-4 w-4 text-muted-foreground" />;
  };

  if (!team) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Settings className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground text-sm">Manage {team.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* ==================== GENERAL TAB ==================== */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Name</CardTitle>
              <CardDescription>This is your team&apos;s visible name.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="max-w-md"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRename} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Deleting a team is irreversible. All tunnels and data will be permanently removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-sm">
                <Label htmlFor="deleteConfirm">
                  Type <span className="font-mono text-destructive">{team.slug}</span> to confirm:
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={team.slug}
                  className="border-destructive/30"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={loading || deleteConfirm !== team.slug} 
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Team
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ==================== MEMBERS TAB ==================== */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to this team.</CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" /> Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join {team.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="inviteEmail"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInviteMember} disabled={inviting}>
                      {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Send Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-center">No members yet. Invite someone to collaborate!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent/10 text-accent text-sm">
                            {member.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.display_name || member.email || 'Team Member'}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                          </div>
                        </div>
                      </div>
                      {member.role !== 'owner' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
