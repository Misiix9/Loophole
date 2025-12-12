import type { Metadata } from "next";
import { Lexend, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Loophole | Localhost Tunnels",
  description: "Secure, persistent localhost tunnels for teams.",
  icons: {
    icon: "/favicon.svg",
  },
};

import { SidebarProvider } from "@/components/sidebar-provider";
import { UserProvider } from "@/context/user-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} scroll-behavior-smooth`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-accent/30 selection:text-white">
        <UserProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
