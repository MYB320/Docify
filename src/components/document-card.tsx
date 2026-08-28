"use client";

import { DocumentData, deleteDocument, toggleStarDocument, assignDocumentFolder } from "@/server/documents";
import { FolderData } from "@/server/folders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MoreVertical,
  Trash2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Eye,
  Edit3,
  Download,
  FileDown,
  FileCode,
  FileType,
  Star,
  Folder as FolderIcon,
  Tag as TagIcon,
  Check,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  exportToMarkdown,
  exportToHtml,
  exportToTxt,
} from "@/lib/export-utils";
import { TagDialog } from "@/components/tag-dialog";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: DocumentData;
  folders?: FolderData[];
  onTagClick?: (tag: string) => void;
  onFolderClick?: (folderId: string) => void;
}

export function DocumentCard({
  document,
  folders = [],
  onTagClick,
  onFolderClick,
}: DocumentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [isStarred, setIsStarred] = useState(document.isStarred);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    document.folderId || null
  );
  const [tags, setTags] = useState<string[]>(document.tags || []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isOwner = document.userRole === "owner";
  const isShared = !isOwner;
  const currentFolder = folders.find((f) => f.id === currentFolderId) || document.folder;

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previous = isStarred;
    setIsStarred(!previous);

    const res = await toggleStarDocument(document.id);
    if (res.error) {
      setIsStarred(previous);
      toast.error(res.error.message);
    } else {
      toast.success(res.data?.isStarred ? "Added to Starred" : "Removed from Starred");
      router.refresh();
    }
  };

  const handleAssignFolder = async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    const res = await assignDocumentFolder(document.id, folderId);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success(
        folderId
          ? `Moved to "${folders.find((f) => f.id === folderId)?.name}"`
          : "Removed from folder"
      );
      router.refresh();
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteDocument(document.id);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success("Document deleted");
        router.refresh();
      }
    });
  };

  return (
    <>
      <Card className="group relative rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col justify-between min-h-[145px]">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors leading-snug">
                  {document.title || "Untitled Document"}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {formatDistanceToNow(new Date(document.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-1">
            {/* Star button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleStar}
              className={cn(
                "h-8 w-8 transition-opacity cursor-pointer",
                isStarred
                  ? "text-amber-500 opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500"
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

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/documents/${document.id}`}
                    className="cursor-pointer gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Document
                  </Link>
                </DropdownMenuItem>

                {isOwner && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setShowTagDialog(true)}
                      className="cursor-pointer gap-2"
                    >
                      <TagIcon className="h-4 w-4" />
                      Manage Tags
                    </DropdownMenuItem>

                    {/* Move to Folder Submenu */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer gap-2">
                        <FolderIcon className="h-4 w-4" />
                        Folder
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48 max-h-56 overflow-y-auto">
                        <DropdownMenuItem
                          onClick={() => handleAssignFolder(null)}
                          className="cursor-pointer text-xs justify-between"
                        >
                          <span>No Folder</span>
                          {!currentFolderId && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {folders.length === 0 ? (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                            No folders created yet
                          </div>
                        ) : (
                          folders.map((f) => (
                            <DropdownMenuItem
                              key={f.id}
                              onClick={() => handleAssignFolder(f.id)}
                              className="cursor-pointer text-xs justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="size-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: f.color }}
                                />
                                <span className="truncate">{f.name}</span>
                              </div>
                              {currentFolderId === f.id && (
                                <Check className="h-3.5 w-3.5 shrink-0" />
                              )}
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </>
                )}

                {/* Export Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-40">
                    <DropdownMenuItem
                      onClick={() => {
                        exportToMarkdown(document.title, document.content);
                        toast.success("Markdown exported (.md)");
                      }}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <FileDown className="h-3.5 w-3.5 text-blue-500" />
                      Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        exportToHtml(document.title, document.content);
                        toast.success("HTML exported (.html)");
                      }}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <FileCode className="h-3.5 w-3.5 text-amber-500" />
                      HTML (.html)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        exportToTxt(document.title, document.content);
                        toast.success("Plain text (.txt)");
                      }}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <FileType className="h-3.5 w-3.5 text-emerald-500" />
                      Plain Text (.txt)
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive cursor-pointer gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Folder & Tags Section */}
        <div className="flex flex-wrap items-center gap-1.5 my-2">
          {currentFolder && (
            <Badge
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onFolderClick?.(currentFolder.id);
              }}
              className="text-[10px] h-5 px-2 gap-1.5 font-normal bg-muted/30 hover:bg-muted cursor-pointer transition-colors"
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: currentFolder.color || "#6366f1" }}
              />
              <span className="truncate max-w-[110px]">{currentFolder.name}</span>
            </Badge>
          )}

          {tags &&
            tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  onTagClick?.(tag);
                }}
                className="text-[10px] h-5 px-1.5 font-normal cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                #{tag}
              </Badge>
            ))}

          {tags && tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              +{tags.length - 3}
            </span>
          )}
        </div>

        {/* Bottom Action / Quick Link */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1.5">
            {isShared ? (
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 gap-1 font-normal capitalize"
                >
                  {document.userRole === "editor" ? (
                    <Edit3 className="h-2.5 w-2.5" />
                  ) : (
                    <Eye className="h-2.5 w-2.5" />
                  )}
                  {document.userRole}
                </Badge>
                {document.owner && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                    by {document.owner.name}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                My Document
              </span>
            )}
          </div>

          <Link
            href={`/documents/${document.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors"
          >
            <span>{isShared && document.userRole === "viewer" ? "View" : "Open"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isOwner && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{document.title}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Tag Management Dialog */}
      {showTagDialog && (
        <TagDialog
          documentId={document.id}
          documentTitle={document.title}
          initialTags={tags}
          open={showTagDialog}
          onOpenChange={setShowTagDialog}
          onTagsUpdated={(newTags) => setTags(newTags)}
        />
      )}
    </>
  );
}
