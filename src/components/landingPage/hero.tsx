import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now with real-time AI assistance
          </div>

          <h1 className="font-sans font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tight text-balance mb-6">
            Write together.
            <br />
            <span className="text-primary">Ship faster.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-10 leading-relaxed">
            The collaborative text editor built for modern teams. Real-time
            editing, powerful integrations, and AI-powered writing assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/signup">
                Start writing for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-transparent"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free forever for small teams
          </p>
        </div>

        {/* Visual representation */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
                team-proposal.md
              </div>
            </div>
            <div className="p-8 space-y-4 font-mono text-sm">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  JD
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                  SK
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-primary/20 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-primary/10 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
