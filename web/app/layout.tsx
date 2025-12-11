import type { Metadata } from "next";
import { Lexend, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Loophole | Localhost Tunnels",
  description: "Secure, persistent localhost tunnels for teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          lexend.variable,
          jetbrainsMono.variable
        )}>
        {children}
      </body>
    </html>
  );
}
