"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/share-dialog";
import { ExternalLink, Copy, QrCode, Clock, Check, Activity, Trash2, Power, AlertTriangle, ArrowUpRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

  // Real Data Metrics
  const totalRequests = tunnel.total_requests || 0;
  const bandwidthStr = formatBytes(tunnel.bandwidth_bytes);
  const lastActiveText = tunnel.last_active_at 
    ? formatDistanceToNow(new Date(tunnel.last_active_at), { addSuffix: true })
    : 'Never';

  return (
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogTrigger asChild>
            <Card className="bg-card border-border flex flex-col group hover:border-accent/50 transition-all duration-300 cursor-pointer relative overflow-hidden h-full hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
            {/* Status Indicator Line */}
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
                 {/* URL Preview */}
                 <div className="text-xs font-mono text-muted-foreground truncate opacity-70 mb-1 hover:opacity-100 transition-opacity bg-secondary/30 p-1 rounded px-2">
                    {tunnel.current_url.replace('https://', '')}
                 </div>

                 {/* Real Stats Grid (Mini) */}
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
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={handleCopy}
                    title="Copy URL"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                
                {isOwner && <div onClick={(e) => e.stopPropagation()}><ShareDialog tunnelId={tunnel.id} projectName={tunnel.project_name} /></div>}

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-7 text-xs gap-1.5 hover:text-accent hover:bg-accent/10"
                    onClick={handleVisit}
                >
                    Visit <ArrowUpRight className="h-3 w-3" />
                </Button>
            </CardFooter>
            </Card>
        </DialogTrigger>

        {/* DETAIL MODAL */}
        <DialogContent className="bg-card border-border sm:max-w-md text-foreground">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                    <span className="text-accent">#</span> {tunnel.project_name} 
                    {isOnline && <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full border border-success/30 font-normal">Online</span>}
                </DialogTitle>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                    ID: {tunnel.id}
                </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
                {/* QR Code Column */}
                <div className="bg-white p-4 rounded-lg flex items-center justify-center border border-border shadow-inner">
                    <QRCodeSVG value={tunnel.current_url} size={140} className="w-full h-full" />
                </div>

                {/* Details Column */}
                <div className="space-y-4">
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

            <Separator className="bg-border" />

            {/* REAL ANALYTICS */}
            <div className="grid grid-cols-3 gap-2 text-center py-2">
                 <div className="p-3 bg-secondary/50 rounded hover:bg-secondary/70 transition-colors">
                     <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Requests</div>
                     <div className="text-lg font-bold text-foreground mt-1">{totalRequests.toLocaleString()}</div>
                 </div>
                 <div className="p-3 bg-secondary/50 rounded hover:bg-secondary/70 transition-colors">
                     <div className="text-[10px] text-muted-foreground uppercase font-semibold">Bandwidth</div>
                     <div className="text-lg font-bold text-foreground mt-1">{bandwidthStr}</div>
                 </div>
                 <div className="p-3 bg-secondary/50 rounded hover:bg-secondary/70 transition-colors">
                     <div className="text-[10px] text-muted-foreground uppercase font-semibold">Last Activity</div>
                     <div className="text-lg font-bold text-accent mt-1 text-sm pt-1">{lastActiveText}</div>
                 </div>
            </div>

            <Separator className="bg-border" />

            {/* Danger Zone */}
            <div className="flex justify-between items-center pt-2">
                 <Button variant="outline" size="sm" className="text-xs border-border text-muted-foreground hover:bg-secondary">
                    <Power className="h-3 w-3 mr-2" /> Restart
                 </Button>
                 <Button variant="destructive" size="sm" className="text-xs bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
                    <Trash2 className="h-3 w-3 mr-2" /> Kill Tunnel
                 </Button>
            </div>
        </DialogContent>
    </Dialog>
  );
}
