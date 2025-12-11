"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/share-dialog";
import { ExternalLink, Copy, QrCode, Clock, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
  last_heartbeat?: string;
  team_id?: string;
};

interface TunnelCardProps {
  tunnel: Tunnel;
  isOwner?: boolean; // If true, show Share/Settings buttons 
}

export function TunnelCard({ tunnel, isOwner = true }: TunnelCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tunnel.current_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = tunnel.status === 'online';
  const lastHeartbeatText = tunnel.last_heartbeat 
    ? formatDistanceToNow(new Date(tunnel.last_heartbeat), { addSuffix: true })
    : 'Unknown';

  // Extract port from project name if possible (e.g. "Project 3000")
  const portMatch = tunnel.project_name.match(/(\d{4})/);
  const displayPort = portMatch ? portMatch[0] : null;

  return (
    <Card className="bg-slate-900 border-slate-800 flex flex-col group hover:border-slate-700 transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium leading-none truncate pr-4 text-slate-200">
                {tunnel.project_name || 'Untitled Project'}
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-2">
               <span className={`inline-flex items-center gap-1.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  {isOnline ? 'Online' : 'Offline'}
               </span>
               {displayPort && (
                   <>
                    <span className="text-slate-700 mx-1">•</span>
                    <span className="font-mono text-slate-400">Port {displayPort}</span>
                   </>
               )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1">
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={handleCopy}
                title="Copy URL"
            >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
             </Button>
             
             <Dialog>
                 <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" title="Show QR Code">
                        <QrCode className="h-4 w-4" />
                    </Button>
                 </DialogTrigger>
                 <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-xs">
                     <DialogHeader>
                         <DialogTitle className="text-center text-slate-200">{tunnel.project_name}</DialogTitle>
                     </DialogHeader>
                     <div className="flex justify-center p-4 bg-white rounded-lg mx-auto">
                        <QRCodeSVG value={tunnel.current_url} size={200} />
                     </div>
                     <p className="text-center text-xs text-slate-500 font-mono break-all">
                         {tunnel.current_url}
                     </p>
                 </DialogContent>
             </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="p-2.5 bg-slate-950 rounded-md border border-slate-800 font-mono text-xs text-slate-300 break-all transition-colors group-hover:border-slate-700/50">
           {tunnel.current_url}
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            <span>Last seen {lastHeartbeatText}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
         {isOwner && <ShareDialog tunnelId={tunnel.id} projectName={tunnel.project_name} />}
         
         <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300"
            onClick={() => window.open(tunnel.current_url, '_blank')}
         >
             Visit <ExternalLink className="h-3 w-3" />
         </Button>
      </CardFooter>
    </Card>
  );
}
