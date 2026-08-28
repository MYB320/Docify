"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateDocumentTags } from "@/server/documents";
import { toast } from "sonner";
import { Loader2, Plus, Tag as TagIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface TagDialogProps {
  documentId: string;
  documentTitle: string;
  initialTags?: string[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagsUpdated?: (tags: string[]) => void;
}

export function TagDialog({
  documentId,
  documentTitle,
  initialTags = [],
  open,
  onOpenChange,
  onTagsUpdated,
}: TagDialogProps) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [newTagInput, setNewTagInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, "");
    if (!cleanTag) return;

    if (tags.includes(cleanTag)) {
      toast.info(`Tag "#${cleanTag}" already exists`);
      setNewTagInput("");
      return;
    }

    setTags([...tags, cleanTag]);
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateDocumentTags(documentId, tags);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success("Tags updated successfully");
        onTagsUpdated?.(tags);
        router.refresh();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-primary" />
            Manage Tags
          </DialogTitle>
          <DialogDescription>
            Add or remove tags for &quot;{documentTitle}&quot; to easily organize and search.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Add Tag Input */}
          <form onSubmit={handleAddTag} className="flex gap-2">
            <Input
              placeholder="Type tag name and press enter..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              disabled={isPending}
              className="h-9 text-sm"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={!newTagInput.trim() || isPending}
              className="h-9 px-3 text-xs gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </form>

          {/* Current Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Applied Tags ({tags.length})
            </label>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 italic py-2">
                No tags added yet. Type a tag name above.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-lg bg-muted/40 border">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs pl-2 pr-1 py-0.5 gap-1 bg-background hover:bg-background/80"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-1.5">
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
