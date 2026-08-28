import { AuthHeader } from "@/components/authHeader";
import Header from "@/components/header";
import ThemeToggle from "@/components/themeSwitcher";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StartingItem } from "@/components/stratingItem";
import { getUserDocuments, getSharedDocuments } from "@/server/documents";
import { getUserFolders } from "@/server/folders";
import { DashboardClient } from "@/components/dashboard-client";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/");

  const [userDocsRes, sharedDocsRes, foldersRes] = await Promise.all([
    getUserDocuments(),
    getSharedDocuments(),
    getUserFolders(),
  ]);

  const userDocs = userDocsRes.data || [];
  const sharedDocs = sharedDocsRes.data || [];
  const folders = foldersRes.data || [];
  const totalDocs = userDocs.length + sharedDocs.length;

  return (
    <div className="min-h-dvh flex flex-col">
      <Header link="/documents">
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <AuthHeader user={session?.user} />
        </div>
      </Header>
      <div className="flex flex-col flex-1 mx-auto container px-4">
        <StartingItem user={session.user} showActionBtn={totalDocs > 0} />

        <DashboardClient
          initialUserDocs={userDocs}
          initialSharedDocs={sharedDocs}
          initialFolders={folders}
        />
      </div>
    </div>
  );
}
