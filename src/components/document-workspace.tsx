"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/editor";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Trash2,
  Copy,
  Eye,
  Edit3,
  Download,
  FileDown,
  FileCode,
  FileType,
  Printer,
  ChevronDown,
  Star,
  Folder as FolderIcon,
  Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  toggleStarDocument,
  assignDocumentFolder,
  type DocumentData,
} from "@/server/documents";
import { getUserFolders, FolderData } from "@/server/folders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiAssistant } from "@/components/ai-assistant";
import { ShareCard } from "@/components/share-card";
import { TagDialog } from "@/components/tag-dialog";
import {
  exportToPdf,
  exportToMarkdown,
  exportToHtml,
  exportToTxt,
} from "@/lib/export-utils";
import { cn } from "@/lib/utils";

interface DocumentWorkspaceProps {
  initialDocument?: DocumentData | null;
  isNew?: boolean;
}

export function DocumentWorkspace({
  initialDocument,
  isNew = false,
}: DocumentWorkspaceProps) {
  const router = useRouter();
  const [docId, setDocId] = useState<string | null>(
    initialDocument?.id || null
  );
  const [title, setTitle] = useState(
    initialDocument?.title || (isNew ? "Untitled Document" : "")
  );
  const [content, setContent] = useState(initialDocument?.content || "");
  const [isStarred, setIsStarred] = useState(initialDocument?.isStarred || false);
  const [folderId, setFolderId] = useState<string | null>(
    initialDocument?.folderId || null
  );
  const [tags, setTags] = useState<string[]>(initialDocument?.tags || []);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "unsaved"
  >("saved");
  const [, setLastSaved] = useState<Date | null>(
    initialDocument ? new Date(initialDocument.updatedAt) : null
  );
  const [isPending, startTransition] = useTransition();

  const userRole = initialDocument?.userRole || "owner";
  const isOwner = userRole === "owner";
  const canEdit = userRole === "owner" || userRole === "editor";

  const isInitialMount = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch folders for assignment
  useEffect(() => {
    async function loadFolders() {
      const res = await getUserFolders();
      if (res.data) {
        setFolders(res.data);
      }
    }
    loadFolders();
  }, []);

  // Auto-save logic with debounce (only if user can edit)
  useEffect(() => {
    if (!canEdit) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus("unsaved");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSave(title, content);
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [title, content, canEdit]);

  const handleSave = async (currentTitle: string, currentContent: string) => {
    if (!canEdit) return;

    setSaveStatus("saving");

    if (isNew && !docId) {
      const res = await createDocument({
        title: currentTitle.trim() || "Untitled Document",
        content: currentContent,
        folderId,
        tags,
        isStarred,
      });

      if (res.error) {
        setSaveStatus("unsaved");
        toast.error(res.error.message);
      } else if (res.data) {
        setDocId(res.data.id);
        setLastSaved(new Date(res.data.updatedAt));
        setSaveStatus("saved");
        toast.success("Document created and saved!");
        window.history.replaceState(null, "", `/documents/${res.data.id}`);
      }
    } else if (docId) {
      const res = await updateDocument(docId, {
        title: currentTitle.trim() || "Untitled Document",
        content: currentContent,
        folderId,
        tags,
        isStarred,
      });

      if (res.error) {
        setSaveStatus("unsaved");
        toast.error(res.error.message);
      } else if (res.data) {
        setLastSaved(new Date(res.data.updatedAt));
        setSaveStatus("saved");
      }
    }
  };

  const handleManualSave = () => {
    handleSave(title, content);
  };

  const handleToggleStar = async () => {
    if (!docId) {
      setIsStarred(!isStarred);
      return;
    }

    const prev = isStarred;
    setIsStarred(!prev);
    const res = await toggleStarDocument(docId);
    if (res.error) {
      setIsStarred(prev);
      toast.error(res.error.message);
    } else {
      toast.success(res.data?.isStarred ? "Starred" : "Unstarred");
    }
  };

  const handleAssignFolder = async (newFolderId: string | null) => {
    setFolderId(newFolderId);
    if (docId) {
      const res = await assignDocumentFolder(docId, newFolderId);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(
          newFolderId
            ? `Moved to "${folders.find((f) => f.id === newFolderId)?.name}"`
            : "Removed from folder"
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!docId) {
      router.push("/documents");
      return;
    }

    startTransition(async () => {
      const res = await deleteDocument(docId);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success("Document deleted");
        router.push("/documents");
      }
    });
  };

  const handleCopyText = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    navigator.clipboard.writeText(`${title}\n\n${plainText}`);
    toast.success("Document copied to clipboard");
  };

  const activeFolder = folders.find((f) => f.id === folderId);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Top Navigation / Action Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents" aria-label="Back to documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleStar}
            className={cn(
              "h-8 w-8 cursor-pointer shrink-0",
              isStarred
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isStarred ? "Unstar document" : "Star document"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                isStarred && "fill-amber-500 text-amber-500"
              )}
            />
            <span className="sr-only">Star</span>
          </Button>

          <div className="flex-1 max-w-md min-w-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              disabled={!canEdit}
              className="h-8 font-semibold text-base border-transparent hover:border-input focus-visible:border-input focus-visible:ring-0 bg-transparent px-2 disabled:opacity-90"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            {!canEdit ? (
              <Badge variant="secondary" className="gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" /> View Only
              </Badge>
            ) : (
              <>
                {userRole === "editor" && (
                  <Badge variant="secondary" className="gap-1 text-primary">
                    <Edit3 className="h-3 w-3" /> Editor
                  </Badge>
                )}
                {saveStatus === "saving" && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                  </Badge>
                )}
                {saveStatus === "saved" && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    <Cloud className="h-3 w-3" /> Saved
                  </Badge>
                )}
                {saveStatus === "unsaved" && (
                  <Badge
                    variant="outline"
                    className="gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  >
                    <CloudOff className="h-3 w-3" /> Unsaved
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Document Owner indicator if shared */}
          {initialDocument?.owner && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
              <span>Owner:</span>
              <Avatar className="h-4 w-4">
                <AvatarImage src={initialDocument.owner.image || ""} />
                <AvatarFallback className="text-[9px]">
                  {initialDocument.owner.name.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-[90px]">
                {initialDocument.owner.name}
              </span>
            </div>
          )}

          {/* Folder Assignment Dropdown */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5 text-xs h-8 hidden md:flex"
                >
                  <FolderIcon className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[90px]">
                    {activeFolder ? activeFolder.name : "No Folder"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel className="text-xs">Assign Folder</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAssignFolder(null)}
                  className="cursor-pointer justify-between"
                >
                  <span>No Folder</span>
                  {!folderId && <Check className="h-3.5 w-3.5" />}
                </DropdownMenuItem>
                {folders.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => handleAssignFolder(f.id)}
                    className="cursor-pointer justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {folderId === f.id && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Manage Tags Button */}
          {docId && isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagDialog(true)}
              className="cursor-pointer gap-1.5 text-xs h-8 hidden md:flex"
            >
              <TagIcon className="h-3.5 w-3.5" />
              <span>Tags ({tags.length})</span>
            </Button>
          )}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1 text-xs h-8"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Export Document</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  exportToPdf();
                  toast.success("Print/PDF dialog opened");
                }}
                className="cursor-pointer text-xs"
              >
                <Printer className="h-3.5 w-3.5 mr-2 text-rose-500" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  exportToMarkdown(title, content);
                  toast.success("Markdown exported (.md)");
                }}
                className="cursor-pointer text-xs"
              >
                <FileDown className="h-3.5 w-3.5 mr-2 text-blue-500" />
                Export as Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  exportToHtml(title, content);
                  toast.success("HTML exported (.html)");
                }}
                className="cursor-pointer text-xs"
              >
                <FileCode className="h-3.5 w-3.5 mr-2 text-amber-500" />
                Export as HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  exportToTxt(title, content);
                  toast.success("Plain text exported (.txt)");
                }}
                className="cursor-pointer text-xs"
              >
                <FileType className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                Export as Plain Text (.txt)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="cursor-pointer hidden sm:flex gap-1.5 h-8 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>

          {canEdit && (
            <Button
              variant="default"
              size="sm"
              onClick={handleManualSave}
              disabled={saveStatus === "saving"}
              className="cursor-pointer gap-1.5 h-8 text-xs"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          )}

          {isOwner && docId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer h-8 w-8"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete document?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    &quot;{title}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      {/* 2-Column Workspace Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1st Column: Large Spacious Text Editor */}
          <div className="lg:col-span-8 xl:col-span-8 min-w-0">
            <Editor
              content={content}
              onChange={(newContent) => setContent(newContent)}
              onEditorReady={(inst) => setEditorInstance(inst)}
              placeholder={
                canEdit
                  ? "Start writing your document here..."
                  : "This document is read-only."
              }
              editable={canEdit}
              className="min-h-[75vh] shadow-sm"
            />
          </div>

          {/* 2nd Column: AI Assistant & Share Cards */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-16 no-print">
            {/* AI Assistant Card */}
            {canEdit && (
              <AiAssistant editor={editorInstance} />
            )}

            {/* Share & Collaborate Card */}
            <ShareCard
              documentId={docId}
              documentTitle={title}
              isOwner={isOwner}
            />
          </div>
        </div>
      </main>

      {/* Tag Management Dialog */}
      {docId && showTagDialog && (
        <TagDialog
          documentId={docId}
          documentTitle={title}
          initialTags={tags}
          open={showTagDialog}
          onOpenChange={setShowTagDialog}
          onTagsUpdated={(newTags) => setTags(newTags)}
        />
      )}
    </div>
  );
}
