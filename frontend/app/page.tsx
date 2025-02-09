"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import('@/components/three-scene'), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <ThreeScene />
      <div className="relative z-10 container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-left space-y-8">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Decentralized Insurance Platform
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Built on Flare and Mina protocols,
            we provide a transparent, efficient, and secure platform for both insurance providers and claimants.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-start sm:gap-6 mt-8">
            <Button asChild size="lg" className="border border-background text-background bg-accent">
              <Link href="/insurer">
                For Insurers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="lg" className="border border-accent text-accent bg-background">
              <Link href="/claimer">
                For Claimants
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
