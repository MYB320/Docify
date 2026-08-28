import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DocumentWorkspace } from "@/components/document-workspace";

export const metadata = {
  title: "New Document | Docify",
  description: "Create a new document",
};

export default async function NewDocumentPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <DocumentWorkspace isNew />;
}
