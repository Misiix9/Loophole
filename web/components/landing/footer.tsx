import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="py-20 border-t border-white/5 bg-black/20 text-sm">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30">
                                <div className="w-4 h-4 rounded-full bg-accent"></div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">Loophole</span>
                        </div>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            The most secure and fastest way to expose your local server to the internet. Built for modern development teams.
                        </p>
                        <div className="text-muted-foreground">
                            A product by <span className="font-bold text-white">Selora</span>.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-foreground">Product</h4>
                            <Link href="/login" className="text-muted-foreground hover:text-white transition-colors">Download</Link>
                            <Link href="#pricing" className="text-muted-foreground hover:text-white transition-colors">Pricing</Link>
                            <Link href="/login" className="text-muted-foreground hover:text-white transition-colors">Login</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-foreground">Resources</h4>
                            <a href="https://github.com/Misiix9/Loophole" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
                    <div className="text-muted-foreground">
                        © 2025 Selora. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/Misiix9/Loophole" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
