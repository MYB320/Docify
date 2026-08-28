"use client";

import { useState, useMemo, useTransition } from "react";
import { DocumentData } from "@/server/documents";
import { FolderData, deleteFolder } from "@/server/folders";
import { DocumentCard } from "@/components/document-card";
import { FolderDialog } from "@/components/folder-dialog";
import EmptyDoc from "@/components/emptyDoc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Search,
  FileText,
  Users,
  Star,
  Folder as FolderIcon,
  FolderPlus,
  ArrowUpDown,
  X,
  Trash2,
  Tag as TagIcon,
  FilterX,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  initialUserDocs: DocumentData[];
  initialSharedDocs: DocumentData[];
  initialFolders: FolderData[];
}

type SortOption = "updated-desc" | "updated-asc" | "title-asc" | "title-desc";

export function DashboardClient({
  initialUserDocs,
  initialSharedDocs,
  initialFolders,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-docs" | "shared">("my-docs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated-desc");

  const [folders, setFolders] = useState<FolderData[]>(initialFolders);
  const [folderToDelete, setFolderToDelete] = useState<FolderData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Extract all unique tags across all documents
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    [...initialUserDocs, ...initialSharedDocs].forEach((doc) => {
      doc.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [initialUserDocs, initialSharedDocs]);

  // Strip HTML tags for clean full-text search indexing
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").toLowerCase();
  };

  // Filter & Search Documents
  const filterDocuments = (docs: DocumentData[]) => {
    return docs
      .filter((doc) => {
        // Starred Filter
        if (showStarredOnly && !doc.isStarred) {
          return false;
        }

        // Folder Filter
        if (selectedFolderId !== null && doc.folderId !== selectedFolderId) {
          return false;
        }

        // Tag Filter
        if (selectedTag !== null && !doc.tags?.includes(selectedTag)) {
          return false;
        }

        // Full-Text Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const titleMatch = doc.title.toLowerCase().includes(query);
          const tagMatch = doc.tags?.some((t) => t.toLowerCase().includes(query));
          const folderMatch = doc.folder?.name.toLowerCase().includes(query);
          const contentMatch = stripHtml(doc.content || "").includes(query);

          if (!titleMatch && !tagMatch && !folderMatch && !contentMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "updated-desc") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "updated-asc") {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        if (sortBy === "title-asc") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "title-desc") {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  };

  const filteredUserDocs = useMemo(
    () => filterDocuments(initialUserDocs),
    [initialUserDocs, searchQuery, selectedFolderId, selectedTag, showStarredOnly, sortBy]
  );

  const filteredSharedDocs = useMemo(
    () => filterDocuments(initialSharedDocs),
    [initialSharedDocs, searchQuery, selectedFolderId, selectedTag, showStarredOnly, sortBy]
  );

  const starredCount = useMemo(
    () => initialUserDocs.filter((d) => d.isStarred).length,
    [initialUserDocs]
  );

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedFolderId !== null ||
    selectedTag !== null ||
    showStarredOnly;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFolderId(null);
    setSelectedTag(null);
    setShowStarredOnly(false);
  };

  const handleDeleteFolder = () => {
    if (!folderToDelete) return;
    startTransition(async () => {
      const res = await deleteFolder(folderToDelete.id);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(`Folder "${folderToDelete.name}" deleted`);
        setFolders((prev) => prev.filter((f) => f.id !== folderToDelete.id));
        if (selectedFolderId === folderToDelete.id) {
          setSelectedFolderId(null);
        }
        setFolderToDelete(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Full-Text Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Full-text search (title, content, tags, folder)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-xl bg-card border-border/80 text-sm focus-visible:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Starred Filter Button */}
          <Button
            variant={showStarredOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={cn(
              "h-9 gap-1.5 text-xs rounded-lg cursor-pointer transition-colors",
              showStarredOnly
                ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                : "border-border/80"
            )}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                showStarredOnly && "fill-current text-current"
              )}
            />
            <span>Starred</span>
            {starredCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "h-4 px-1 text-[10px] ml-0.5",
                  showStarredOnly
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {starredCount}
              </Badge>
            )}
          </Button>

          {/* New Folder Modal Trigger */}
          <FolderDialog
            onFolderCreated={(newFolder) => {
              setFolders((prev) => [newFolder, ...prev]);
            }}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs rounded-lg border-border/80 cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>New Folder</span>
              </Button>
            }
          />

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs rounded-lg border-border/80 cursor-pointer"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>
                  {sortBy === "updated-desc" && "Recently Updated"}
                  {sortBy === "updated-asc" && "Oldest Updated"}
                  {sortBy === "title-asc" && "Title (A-Z)"}
                  {sortBy === "title-desc" && "Title (Z-A)"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem onClick={() => setSortBy("updated-desc")}>
                Recently Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("updated-asc")}>
                Oldest Updated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title-asc")}>
                Title (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title-desc")}>
                Title (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <FilterX className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Folders & Tags Carousel / Chips */}
      <div className="space-y-3">
        {/* Folder Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border",
              selectedFolderId === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            )}
          >
            <FolderIcon className="h-3.5 w-3.5" />
            <span>All Folders</span>
            <span className="text-[10px] opacity-75">
              ({initialUserDocs.length})
            </span>
          </button>

          {folders.map((f) => {
            const count = initialUserDocs.filter(
              (doc) => doc.folderId === f.id
            ).length;
            const isSelected = selectedFolderId === f.id;

            return (
              <div key={f.id} className="relative group shrink-0">
                <button
                  onClick={() =>
                    setSelectedFolderId(isSelected ? null : f.id)
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border",
                    isSelected
                      ? "bg-secondary text-foreground border-primary/50 shadow-xs ring-1 ring-primary/30"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span>{f.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>

                {/* Delete folder trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(f);
                  }}
                  title="Delete Folder"
                  className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm transition-opacity cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tag Filter Chips (if any exist) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <TagIcon className="h-3 w-3" />
              Tags:
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span>#{tag}</span>
                  {isSelected && <X className="h-2.5 w-2.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs for My Documents & Shared with Me */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "my-docs" | "shared")}
        className="w-full"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="my-docs"
              className="gap-2 cursor-pointer rounded-lg text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>My Documents</span>
              {filteredUserDocs.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] ml-0.5"
                >
                  {filteredUserDocs.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="shared"
              className="gap-2 cursor-pointer rounded-lg text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Shared with Me</span>
              {filteredSharedDocs.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] ml-0.5"
                >
                  {filteredSharedDocs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Documents Tab */}
        <TabsContent value="my-docs" className="pt-4">
          {filteredUserDocs.length === 0 ? (
            isFiltered ? (
              <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-full bg-muted text-muted-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">No matching documents</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We couldn&apos;t find any documents matching your current search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2 text-xs cursor-pointer"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <EmptyDoc />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUserDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  folders={folders}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onFolderClick={(fId) => setSelectedFolderId(fId)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Shared with Me Tab */}
        <TabsContent value="shared" className="pt-4">
          {filteredSharedDocs.length === 0 ? (
            <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">
                {isFiltered ? "No matching shared documents" : "No shared documents"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isFiltered
                  ? "Try adjusting your search or filters."
                  : "Documents that other users share with you will appear here with viewer or editor access."}
              </p>
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2 text-xs cursor-pointer"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSharedDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  folders={folders}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onFolderClick={(fId) => setSelectedFolderId(fId)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Folder Alert Dialog */}
      {folderToDelete && (
        <AlertDialog
          open={Boolean(folderToDelete)}
          onOpenChange={(open) => !open && setFolderToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete folder &quot;{folderToDelete.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                Documents inside this folder will not be deleted; they will simply be moved to &quot;No Folder&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFolder}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Folder
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
