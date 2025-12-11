"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Trash2, Save, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner or generic toast, will just use alert if not available, wait, using standard alert for now

export default function TeamSettingsPage({ params }: { params: { teamSlug: string } }) {
  const [team, setTeam] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('teams').select('*').eq('slug', params.teamSlug).single();
      if (data) {
        setTeam(data);
        setName(data.name);
      }
    };
    fetchTeam();
  }, [params.teamSlug]);

  const handleRename = async () => {
    setLoading(true);
    const { error } = await supabase.from('teams').update({ name }).eq('id', team.id);
    setLoading(false);
    if (error) {
       alert("Error updating team: " + error.message);
    } else {
       alert("Team updated successfully");
       router.refresh();
    }
  };

  const handleDelete = async () => {
     const confirmSlug = prompt(`To confirm deletion, type "${team.slug}" below:`);
     if (confirmSlug !== team.slug) return;

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

  if (!team) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
      </div>

       <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
             <TabsTrigger value="general">General</TabsTrigger>
             <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle>Team Name</CardTitle>
                   <CardDescription>This is your team's visible name.</CardDescription>
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
                      <Save className="h-4 w-4" /> Save Changes
                   </Button>
                </CardFooter>
             </Card>

             <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                   <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Danger Zone
                   </CardTitle>
                   <CardDescription>
                      Deleting a team is irreversible. All tunnels and data associated with this team will be permanently removed.
                   </CardDescription>
                </CardHeader>
                <CardFooter>
                   <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Delete Team
                   </Button>
                </CardFooter>
             </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
              <Card>
                 <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage who has access to this team.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <div className="text-center space-y-2">
                           <Users className="h-8 w-8 mx-auto opacity-50" />
                           <p>Member management is coming soon to Loophole Pro.</p>
                        </div>
                    </div>
                 </CardContent>
              </Card>
          </TabsContent>
       </Tabs>
    </div>
  );
}
