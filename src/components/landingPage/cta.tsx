import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-sans font-bold text-4xl sm:text-5xl text-balance mb-6">
            Ready to transform how your team writes?
          </h2>
          <p className="text-lg text-muted-foreground text-pretty mb-10 leading-relaxed">
            Join thousands of teams already collaborating better with
            CollabEdit. Start for free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/signup">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-transparent"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
