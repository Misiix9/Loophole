"use client";

import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";

import { ModalProvider } from "@/context/modal-context";

export default function Home() {
  return (
    <ModalProvider>
      <div className="flex flex-col min-h-screen bg-black text-foreground selection:bg-accent selection:text-white">
        <Navbar />

        <main className="flex-1">
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
          <CTA />
        </main>

        <Footer />
      </div>
    </ModalProvider>
  );
}
