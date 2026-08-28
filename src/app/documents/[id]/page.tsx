import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDocument } from "@/server/documents";
import { DocumentWorkspace } from "@/components/document-workspace";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { id } = await params;
  const res = await getDocument(id);
  return {
    title: res.data?.title ? `${res.data.title} | Docify` : "Document | Docify",
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const res = await getDocument(id);

  if (res.error || !res.data) {
    notFound();
  }

  return <DocumentWorkspace initialDocument={res.data} />;
}
