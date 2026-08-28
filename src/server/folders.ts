"use server";

import { db } from "@/db/drizzle";
import { folder, document } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export interface FolderData {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  docCount?: number;
}

export interface FolderResponse<T = FolderData> {
  data?: T;
  error?: {
    message: string;
  };
}

export async function getUserFolders(): Promise<FolderResponse<FolderData[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const folders = await db
      .select()
      .from(folder)
      .where(eq(folder.userId, session.user.id))
      .orderBy(desc(folder.createdAt));

    // Get document count for each folder
    const docs = await db
      .select({ folderId: document.folderId })
      .from(document)
      .where(eq(document.userId, session.user.id));

    const counts: Record<string, number> = {};
    docs.forEach((d) => {
      if (d.folderId) {
        counts[d.folderId] = (counts[d.folderId] || 0) + 1;
      }
    });

    return {
      data: folders.map((f) => ({
        ...f,
        docCount: counts[f.id] || 0,
      })),
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch folders",
      },
    };
  }
}

export async function createFolder(
  name: string,
  color: string = "#6366f1"
): Promise<FolderResponse<FolderData>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    if (!name.trim()) {
      return { error: { message: "Folder name is required." } };
    }

    const [newFolder] = await db
      .insert(folder)
      .values({
        id: nanoid(),
        name: name.trim(),
        color,
        userId: session.user.id,
      })
      .returning();

    revalidatePath("/documents");
    return { data: { ...newFolder, docCount: 0 } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to create folder",
      },
    };
  }
}

export async function deleteFolder(
  folderId: string
): Promise<FolderResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    await db
      .delete(folder)
      .where(and(eq(folder.id, folderId), eq(folder.userId, session.user.id)));

    revalidatePath("/documents");
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete folder",
      },
    };
  }
}
