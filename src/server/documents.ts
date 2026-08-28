"use server";

import { db } from "@/db/drizzle";
import { document, documentCollaborator, user, folder } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

export type CollaboratorRole = "owner" | "editor" | "viewer";

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  userId: string;
  isStarred: boolean;
  folderId: string | null;
  tags: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  userRole?: CollaboratorRole;
  folder?: {
    id: string;
    name: string;
    color: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface CollaboratorInfo {
  id: string;
  documentId: string;
  userId: string;
  role: "viewer" | "editor";
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface DocumentResponse<T = DocumentData> {
  data?: T;
  error?: {
    message: string;
  };
}

export async function createDocument(data?: {
  title?: string;
  content?: string;
  folderId?: string | null;
  tags?: string[];
  isStarred?: boolean;
}): Promise<DocumentResponse<DocumentData>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const newDocId = nanoid();
    const title = data?.title?.trim() || "Untitled Document";
    const content = data?.content || "";

    const [newDoc] = await db
      .insert(document)
      .values({
        id: newDocId,
        title,
        content,
        folderId: data?.folderId || null,
        tags: data?.tags || [],
        isStarred: data?.isStarred || false,
        userId: session.user.id,
      })
      .returning();

    revalidatePath("/documents");
    return { data: { ...newDoc, userRole: "owner" } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to create document",
      },
    };
  }
}

export async function updateDocument(
  id: string,
  data: {
    title?: string;
    content?: string;
    folderId?: string | null;
    tags?: string[];
    isStarred?: boolean;
  }
): Promise<DocumentResponse<DocumentData>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    // Check if user is owner
    const [existingDoc] = await db
      .select()
      .from(document)
      .where(eq(document.id, id));

    if (!existingDoc) {
      return { error: { message: "Document not found" } };
    }

    const isOwner = existingDoc.userId === session.user.id;
    let isEditor = false;

    if (!isOwner) {
      const [collab] = await db
        .select()
        .from(documentCollaborator)
        .where(
          and(
            eq(documentCollaborator.documentId, id),
            eq(documentCollaborator.userId, session.user.id)
          )
        );

      if (!collab || collab.role !== "editor") {
        return {
          error: {
            message:
              "You have view-only permissions or cannot edit this document.",
          },
        };
      }
      isEditor = true;
    }

    const updateValues: Partial<typeof document.$inferInsert> = {};
    if (data.title !== undefined) updateValues.title = data.title;
    if (data.content !== undefined) updateValues.content = data.content;
    if (data.folderId !== undefined) updateValues.folderId = data.folderId;
    if (data.tags !== undefined) updateValues.tags = data.tags;
    if (data.isStarred !== undefined) updateValues.isStarred = data.isStarred;

    const [updated] = await db
      .update(document)
      .set(updateValues)
      .where(eq(document.id, id))
      .returning();

    revalidatePath("/documents");
    revalidatePath(`/documents/${id}`);
    return {
      data: {
        ...updated,
        userRole: isOwner ? "owner" : isEditor ? "editor" : "viewer",
      },
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update document",
      },
    };
  }
}

export async function toggleStarDocument(
  id: string
): Promise<DocumentResponse<{ isStarred: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [doc] = await db
      .select()
      .from(document)
      .where(eq(document.id, id));

    if (!doc) {
      return { error: { message: "Document not found" } };
    }

    const newStarred = !doc.isStarred;
    await db
      .update(document)
      .set({ isStarred: newStarred })
      .where(eq(document.id, id));

    revalidatePath("/documents");
    revalidatePath(`/documents/${id}`);
    return { data: { isStarred: newStarred } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to toggle star status",
      },
    };
  }
}

export async function assignDocumentFolder(
  documentId: string,
  folderId: string | null
): Promise<DocumentResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    await db
      .update(document)
      .set({ folderId })
      .where(and(eq(document.id, documentId), eq(document.userId, session.user.id)));

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to assign folder",
      },
    };
  }
}

export async function updateDocumentTags(
  documentId: string,
  tags: string[]
): Promise<DocumentResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    await db
      .update(document)
      .set({ tags })
      .where(eq(document.id, documentId));

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update tags",
      },
    };
  }
}

export async function getDocument(
  id: string
): Promise<DocumentResponse<DocumentData>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [doc] = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        userId: document.userId,
        isStarred: document.isStarred,
        folderId: document.folderId,
        tags: document.tags,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        folderName: folder.name,
        folderColor: folder.color,
      })
      .from(document)
      .leftJoin(folder, eq(document.folderId, folder.id))
      .where(eq(document.id, id));

    if (!doc) {
      return { error: { message: "Document not found" } };
    }

    const folderInfo =
      doc.folderId && doc.folderName
        ? { id: doc.folderId, name: doc.folderName, color: doc.folderColor || "#6366f1" }
        : undefined;

    // Owner check
    if (doc.userId === session.user.id) {
      return {
        data: {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          userId: doc.userId,
          isStarred: doc.isStarred,
          folderId: doc.folderId,
          tags: doc.tags,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          folder: folderInfo,
          userRole: "owner",
        },
      };
    }

    // Collaborator check
    const [collab] = await db
      .select()
      .from(documentCollaborator)
      .where(
        and(
          eq(documentCollaborator.documentId, id),
          eq(documentCollaborator.userId, session.user.id)
        )
      );

    if (collab) {
      const [docOwner] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, doc.userId));

      return {
        data: {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          userId: doc.userId,
          isStarred: doc.isStarred,
          folderId: doc.folderId,
          tags: doc.tags,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          folder: folderInfo,
          userRole: collab.role as "editor" | "viewer",
          owner: docOwner || undefined,
        },
      };
    }

    return {
      error: {
        message:
          "Access denied. You do not have permission to view this document.",
      },
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch document",
      },
    };
  }
}

export async function getUserDocuments(): Promise<
  DocumentResponse<DocumentData[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const docs = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        userId: document.userId,
        isStarred: document.isStarred,
        folderId: document.folderId,
        tags: document.tags,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        folderName: folder.name,
        folderColor: folder.color,
      })
      .from(document)
      .leftJoin(folder, eq(document.folderId, folder.id))
      .where(eq(document.userId, session.user.id))
      .orderBy(desc(document.updatedAt));

    return {
      data: docs.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        userId: d.userId,
        isStarred: d.isStarred,
        folderId: d.folderId,
        tags: d.tags,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        folder:
          d.folderId && d.folderName
            ? { id: d.folderId, name: d.folderName, color: d.folderColor || "#6366f1" }
            : undefined,
        userRole: "owner" as const,
      })),
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch documents",
      },
    };
  }
}

export async function getSharedDocuments(): Promise<
  DocumentResponse<DocumentData[]>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const collabs = await db
      .select()
      .from(documentCollaborator)
      .where(eq(documentCollaborator.userId, session.user.id));

    if (collabs.length === 0) {
      return { data: [] };
    }

    const docIds = collabs.map((c) => c.documentId);
    const docs = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        userId: document.userId,
        isStarred: document.isStarred,
        folderId: document.folderId,
        tags: document.tags,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerImage: user.image,
      })
      .from(document)
      .innerJoin(user, eq(document.userId, user.id))
      .where(inArray(document.id, docIds))
      .orderBy(desc(document.updatedAt));

    const roleMap = new Map(collabs.map((c) => [c.documentId, c.role]));

    const mappedDocs: DocumentData[] = docs.map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      userId: d.userId,
      isStarred: d.isStarred,
      folderId: d.folderId,
      tags: d.tags,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      userRole: (roleMap.get(d.id) || "viewer") as CollaboratorRole,
      owner: {
        id: d.ownerId,
        name: d.ownerName,
        email: d.ownerEmail,
        image: d.ownerImage,
      },
    }));

    return { data: mappedDocs };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch shared documents",
      },
    };
  }
}

export async function deleteDocument(
  id: string
): Promise<DocumentResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [deleted] = await db
      .delete(document)
      .where(and(eq(document.id, id), eq(document.userId, session.user.id)))
      .returning();

    if (!deleted) {
      return {
        error: {
          message: "Only the document owner can delete this document",
        },
      };
    }

    revalidatePath("/documents");
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete document",
      },
    };
  }
}

/* =========================================================
   COLLABORATOR ACTIONS
   ========================================================= */

export async function getCollaborators(
  documentId: string
): Promise<DocumentResponse<CollaboratorInfo[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const collabs = await db
      .select({
        id: documentCollaborator.id,
        documentId: documentCollaborator.documentId,
        userId: documentCollaborator.userId,
        role: documentCollaborator.role,
        createdAt: documentCollaborator.createdAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(documentCollaborator)
      .innerJoin(user, eq(documentCollaborator.userId, user.id))
      .where(eq(documentCollaborator.documentId, documentId));

    const result: CollaboratorInfo[] = collabs.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      userId: c.userId,
      role: c.role as "viewer" | "editor",
      createdAt: c.createdAt,
      user: {
        id: c.userId,
        name: c.userName,
        email: c.userEmail,
        image: c.userImage,
      },
    }));

    return { data: result };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch collaborators",
      },
    };
  }
}

export async function inviteCollaborator(
  documentId: string,
  email: string,
  role: "viewer" | "editor" = "viewer"
): Promise<DocumentResponse<CollaboratorInfo>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [doc] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId));

    if (!doc) {
      return { error: { message: "Document not found." } };
    }

    if (doc.userId !== session.user.id) {
      return {
        error: { message: "Only the document owner can manage collaborators." },
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, trimmedEmail));

    if (!targetUser) {
      return {
        error: {
          message: `No user found with email "${trimmedEmail}". Make sure they have a Docify account.`,
        },
      };
    }

    if (targetUser.id === doc.userId) {
      return {
        error: {
          message: "You are already the owner of this document.",
        },
      };
    }

    const [existingCollab] = await db
      .select()
      .from(documentCollaborator)
      .where(
        and(
          eq(documentCollaborator.documentId, documentId),
          eq(documentCollaborator.userId, targetUser.id)
        )
      );

    let savedCollab;

    if (existingCollab) {
      const [updated] = await db
        .update(documentCollaborator)
        .set({ role })
        .where(eq(documentCollaborator.id, existingCollab.id))
        .returning();
      savedCollab = updated;
    } else {
      const [inserted] = await db
        .insert(documentCollaborator)
        .values({
          id: nanoid(),
          documentId,
          userId: targetUser.id,
          role,
        })
        .returning();
      savedCollab = inserted;
    }

    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/documents");

    return {
      data: {
        id: savedCollab.id,
        documentId: savedCollab.documentId,
        userId: savedCollab.userId,
        role: savedCollab.role as "viewer" | "editor",
        createdAt: savedCollab.createdAt,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          image: targetUser.image,
        },
      },
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to invite collaborator",
      },
    };
  }
}

export async function updateCollaboratorRole(
  documentId: string,
  collaboratorId: string,
  role: "viewer" | "editor"
): Promise<DocumentResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [doc] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId));

    if (!doc || doc.userId !== session.user.id) {
      return { error: { message: "Only the document owner can change roles." } };
    }

    await db
      .update(documentCollaborator)
      .set({ role })
      .where(eq(documentCollaborator.id, collaboratorId));

    revalidatePath(`/documents/${documentId}`);
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update collaborator role",
      },
    };
  }
}

export async function removeCollaborator(
  documentId: string,
  collaboratorId: string
): Promise<DocumentResponse<{ success: boolean }>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: { message: "Unauthorized. Please log in." } };
    }

    const [doc] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId));

    if (!doc) {
      return { error: { message: "Document not found." } };
    }

    const [collab] = await db
      .select()
      .from(documentCollaborator)
      .where(eq(documentCollaborator.id, collaboratorId));

    if (!collab) {
      return { error: { message: "Collaborator not found." } };
    }

    if (doc.userId !== session.user.id && collab.userId !== session.user.id) {
      return {
        error: { message: "Unauthorized to remove this collaborator." },
      };
    }

    await db
      .delete(documentCollaborator)
      .where(eq(documentCollaborator.id, collaboratorId));

    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/documents");
    return { data: { success: true } };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to remove collaborator",
      },
    };
  }
}
