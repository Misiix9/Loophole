"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareDialog } from "@/components/share-dialog";
import { Copy, Clock, Check, Activity, Trash2, ArrowUpRight, Globe, Pencil, Save, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
  last_heartbeat?: string;
  team_id?: string;
  total_requests?: number;
  bandwidth_bytes?: number;
  last_active_at?: string;
  is_public?: boolean;
};

interface TunnelCardProps {
  tunnel: Tunnel;
  isOwner?: boolean;
}

function formatBytes(bytes: number = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function TunnelCard({ tunnel, isOwner = true }: TunnelCardProps) {
  const [copied, setCopied] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [projectName, setProjectName] = useState(tunnel.project_name);
  const [isPublic, setIsPublic] = useState(tunnel.is_public || false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleRename = async () => {
    if (!projectName.trim()) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('tunnels')
      .update({ project_name: projectName })
      .eq('id', tunnel.id);

    setSaving(false);
    if (error) {
      alert("Error renaming tunnel: " + error.message);
    } else {
      router.refresh();
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    setIsPublic(checked);
    
    const { error } = await supabase
      .from('tunnels')
      .update({ is_public: checked })
      .eq('id', tunnel.id);

    if (error) {
      alert("Error updating visibility: " + error.message);
      setIsPublic(!checked);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this tunnel? This action cannot be undone.")) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('tunnels')
      .delete()
      .eq('id', tunnel.id);

    if (error) {
      alert("Error deleting tunnel: " + error.message);
      setDeleting(false);
    } else {
      setDetailOpen(false);
      router.refresh();
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tunnel.current_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tunnel.current_url, '_blank');
  };

  const isOnline = tunnel.status === 'online';
  const lastHeartbeatText = tunnel.last_heartbeat 
    ? formatDistanceToNow(new Date(tunnel.last_heartbeat), { addSuffix: true })
    : 'Unknown';

  const portMatch = tunnel.project_name.match(/(\d{4})/);
  const displayPort = portMatch ? portMatch[0] : null;

  const totalRequests = tunnel.total_requests || 0;
  const bandwidthStr = formatBytes(tunnel.bandwidth_bytes);
  const lastActiveText = tunnel.last_active_at 
    ? formatDistanceToNow(new Date(tunnel.last_active_at), { addSuffix: true })
    : 'Never';

  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogTrigger asChild>
        <Card className="bg-card border-border flex flex-col group hover:border-accent/50 transition-all duration-300 cursor-pointer relative overflow-hidden h-full hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
          <div className={`absolute top-0 left-0 w-full h-[2px] ${isOnline ? 'bg-success' : 'bg-muted'}`} />

          <CardHeader className="pb-2 pt-4 px-4 space-y-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base font-semibold leading-none truncate text-foreground flex items-center gap-2">
                  {tunnel.project_name || 'Untitled Project'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {isOnline ? 'Online' : 'Offline'} {displayPort && `:${displayPort}`}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 py-2 flex-1 flex flex-col gap-4">
            <div className="text-xs font-mono text-muted-foreground truncate opacity-70 mb-1 hover:opacity-100 transition-opacity bg-secondary/30 p-1 rounded px-2">
              {tunnel.current_url.replace('https://', '')}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-secondary/20 p-2 rounded border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase opacity-70">Requests</div>
                <div className="text-sm font-bold font-mono text-foreground">{totalRequests.toLocaleString()}</div>
              </div>
              <div className="bg-secondary/20 p-2 rounded border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase opacity-70">Data</div>
                <div className="text-sm font-bold font-mono text-foreground">{bandwidthStr}</div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 px-4 pb-4 gap-1 border-t border-border/50 bg-secondary/30">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={handleCopy} title="Copy URL">
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            
            {isOwner && <div onClick={(e) => e.stopPropagation()}><ShareDialog tunnelId={tunnel.id} projectName={tunnel.project_name} /></div>}

            <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1.5 hover:text-accent hover:bg-accent/10" onClick={handleVisit}>
              Visit <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </DialogTrigger>

      <DialogContent className="bg-card border-border sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span className="text-accent">#</span> {tunnel.project_name} 
            {isOnline && <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full border border-success/30 font-normal">Online</span>}
          </DialogTitle>
          <div className="text-xs text-muted-foreground font-mono mt-1">ID: {tunnel.id}</div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-white p-2 rounded-lg flex items-center justify-center border border-border shadow-inner">
                <QRCodeSVG value={tunnel.current_url} size={120} className="w-full h-full" />
              </div>
              <div className="space-y-4 flex flex-col justify-center">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Public URL</label>
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded border border-border text-xs font-mono break-all text-foreground transition-colors hover:border-accent/40">
                    <span className="truncate">{tunnel.current_url}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto shrink-0 hover:text-accent" onClick={() => navigator.clipboard.writeText(tunnel.current_url)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Last Sync</label>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="h-4 w-4 text-accent" />
                    {lastHeartbeatText}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Requests</span>
                  <Activity className="h-4 w-4 text-accent" />
                </div>
                <div className="text-2xl font-bold font-mono">{totalRequests.toLocaleString()}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
                  <div className="text-sm text-muted-foreground">Bandwidth</div>
                  <div className="text-xl font-bold font-mono">{bandwidthStr}</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2">
                  <div className="text-sm text-muted-foreground">Last Active</div>
                  <div className="text-sm font-bold text-foreground truncate">{lastActiveText}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-medium">Rename Tunnel</h4>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleRename} disabled={saving || projectName === tunnel.project_name}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Globe className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Public Visibility</h4>
                    <p className="text-xs text-muted-foreground">Allow others to discover this tunnel.</p>
                  </div>
                </div>
                <Switch checked={isPublic} onCheckedChange={handleToggleVisibility} />
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-destructive">Delete Tunnel</h4>
                  <p className="text-xs text-muted-foreground">Permanently remove this tunnel and its history.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
