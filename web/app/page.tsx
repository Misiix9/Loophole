import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <div className="size-3 rounded-full bg-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">Loophole</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-emerald-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          v1.0 Now Live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          Expose your localhost <br /> to the world.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          The fastest way to share your local web server. Secure tunnels, persistent URLs, and team collaboration. No config required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="h-12 px-8 rounded-full bg-emerald-500 text-black font-semibold flex items-center justify-center hover:bg-emerald-400 transition-all hover:scale-105"
          >
            Start Tunneling
          </Link>
          <Link
            href="https://github.com/loophole/cli"
            className="h-12 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            View on GitHub
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
          <FeatureCard
            icon="⚡"
            title="Instant Setup"
            desc="One command to start. No complicated configuration files or router settings."
          />
          <FeatureCard
            icon="🛡️"
            title="Secure by Default"
            desc="Automatic HTTPS for every tunnel. Your data is encrypted end-to-end."
          />
          <FeatureCard
            icon="👥"
            title="Team Collaboration"
            desc="Invite your team. Share persistent development URLs that don't change."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-zinc-600 border-t border-white/10">
        <p>© 2024 Loophole. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
