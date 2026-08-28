import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { GeneralSettings } from "@/components/profile/general-settings";
import { SecuritySettings } from "@/components/profile/security-settings";
import { NotificationSettings } from "@/components/profile/notification-settings";
import { PreferencesSettings } from "@/components/profile/preferences-settings";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={session.user} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProfileSidebar />
          <main className="flex-1 space-y-8">
            <GeneralSettings user={session.user} />
            <SecuritySettings />
            <NotificationSettings />
            <PreferencesSettings />
          </main>
        </div>
      </div>
    </div>
  );
}
