import { AuthHeader } from "@/components/authHeader";
import ThemeToggle from "@/components/themeSwitcher";
import Header from "@/components/header";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landingPage/hero";
import { Stats } from "@/components/landingPage/states";
import { Features } from "@/components/landingPage/features";
import { Pricing } from "@/components/landingPage/pricing";
import { CTA } from "@/components/landingPage/cta";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) redirect("/documents");

  return (
    <div className="min-h-dvh">
      <Header>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="/billing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Billing
          </a>
        </nav>
        <div className="flex gap-4">
          <ThemeToggle />
          <AuthHeader />
        </div>
      </Header>
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <CTA />
      </main>
    </div>
  );
}
