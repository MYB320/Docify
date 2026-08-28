import Header from "@/components/header";
import ThemeToggle from "@/components/themeSwitcher";
import { AuthHeader } from "@/components/authHeader";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BillingView } from "@/components/billing-view";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header link="/documents">
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <AuthHeader user={session?.user} />
        </div>
      </Header>
      <main className="flex-1 container mx-auto">
        <BillingView user={session?.user} />
      </main>
    </div>
  );
}
