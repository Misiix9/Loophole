"use client";

import Link from "next/link";
import { ArrowRight, Terminal, Globe, Shield, Zap } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-background/80 backdrop-blur z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image 
             src="/logo.png" 
             alt="Loophole" 
             width={32} 
             height={32} 
             className="rounded-lg shadow-lg shadow-accent/20"
          />
          <span className="text-xl font-bold tracking-tight">Loophole</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        {/* Ruby Gradient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent-foreground backdrop-blur-sm shadow-sm animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="font-semibold tracking-wide text-xs uppercase">v1.2 Release</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight max-w-5xl mb-8 leading-tight">
          Locally hosted.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Globally available.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
           Secure tunnels to localhost. Real-time traffic analytics. <br className="hidden md:block" />
           Team collaboration built-in. <span className="text-foreground font-medium">No config required.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="h-14 px-10 rounded-full bg-accent text-white font-bold text-lg flex items-center justify-center hover:bg-accent/90 transition-all hover:scale-105 shadow-xl shadow-accent/20 w-full sm:w-auto gap-2 group"
          >
            Start Tunneling <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="h-14 px-10 rounded-full border border-white/10 bg-white/5 text-muted-foreground font-medium flex items-center justify-center font-mono w-full sm:w-auto cursor-copy hover:bg-white/10 transition-colors"
            onClick={() => navigator.clipboard.writeText('npm i -g @loophole/cli')}
          >
            npm i -g @loophole/cli
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl text-left w-full px-4">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-400" />}
            title="Instant Setup"
            desc="One command to expose any local port. HTTPS is enabled by default for all tunnels."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-emerald-400" />}
            title="Production Secure"
            desc="End-to-end encryption. Built-in sophisticated RLS security and private access controls."
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8 text-blue-400" />}
            title="Team Sync"
            desc="Collaborate with your team. Share persistent URLs that never change, even when you restart."
          />
        </div>
      </main>

      <footer className="py-10 text-center text-sm text-muted-foreground border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2024 Loophole Inc.</p>
            <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
      <div className="mb-6 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
