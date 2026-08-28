import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "better-auth";

export function ProfileHeader({ user }: { user: User }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/documents">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Profile Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.name || user.email} • Manage your account settings and
                preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
