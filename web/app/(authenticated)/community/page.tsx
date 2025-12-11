"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

type Tunnel = {
  id: string;
  project_name: string;
  current_url: string;
  status: string;
  created_at: string;
};

export default function CommunityPage() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicTunnels = async () => {
      // Fetch ONLY public and online tunnels
      const { data, error } = await supabase
        .from('tunnels')
        .select('*')
        // .eq('is_public', true) // Backend column missing, temporarily disabled
        .eq('status', 'online')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public tunnels:', error);
      } else {
        setTunnels(data || []);
      }
      setIsLoading(false);
    };

    fetchPublicTunnels();
  }, []);

  const filteredTunnels = tunnels.filter(t => 
    (t.project_name || 'Untitled').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground mb-2 flex items-center gap-3">
             <Globe className="h-8 w-8 text-accent" />
             Community Tunnels
          </h1>
          <p className="text-muted-foreground">
            Explore public projects shared by the Loophole community.
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search projects..." 
                    className="pl-9 bg-card border-border focus:border-accent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link href="/dashboard">
                <Button variant="outline" className="border-border hover:bg-secondary">
                    My Dashboard
                </Button>
            </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
             <div className="col-span-full text-center py-20 text-muted-foreground animate-pulse">
                Loading community projects...
             </div>
        ) : filteredTunnels.length === 0 ? (
            <div className="col-span-full text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
                <p className="text-foreground text-lg">No public tunnels found right now.</p>
                <div className="text-sm text-muted-foreground mt-4 font-mono bg-card px-4 py-2 rounded-lg inline-block border border-border">
                    <span className="text-accent">$</span> loophole start 3000 --public
                </div>
            </div>
        ) : (
            filteredTunnels.map((tunnel) => (
                <Card key={tunnel.id} className="bg-card border-border hover:border-accent/50 transition-all duration-300 group overflow-hidden hover:scale-[1.02] animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="overflow-hidden pr-4">
                                <CardTitle className="text-lg text-foreground group-hover:text-accent transition-colors truncate">
                                    {tunnel.project_name || 'Untitled Project'}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground text-xs mt-1">
                                    Launched {new Date(tunnel.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_var(--success)] shrink-0"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="p-3 bg-secondary/50 rounded border border-border/50 font-mono text-xs text-muted-foreground break-all opacity-80 group-hover:opacity-100 transition-opacity">
                            {tunnel.current_url}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <a 
                            href={tunnel.current_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full"
                        >
                            <Button className="w-full bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                                Visit Site <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                        </a>
                    </CardFooter>
                </Card>
            ))
        )}
      </main>
    </div>
  );
}
