"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CollaboratorInfo,
  getCollaborators,
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from "@/server/documents";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  Copy,
  Globe,
  Loader2,
  Lock,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
  isOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  documentId,
  documentTitle,
  isOwner,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchCollaborators = async () => {
    if (!documentId) return;
    setLoading(true);
    const res = await getCollaborators(documentId);
    if (res.data) {
      setCollaborators(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && documentId) {
      fetchCollaborators();
    }
  }, [open, documentId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      const res = await inviteCollaborator(documentId, email.trim(), role);
      if (res.error) {
        toast.error(res.error.message);
      } else if (res.data) {
        toast.success(`Invited ${res.data.user.name || email} as ${role}`);
        setEmail("");
        fetchCollaborators();
      }
    });
  };

  const handleRoleChange = async (
    collaboratorId: string,
    newRole: "viewer" | "editor"
  ) => {
    startTransition(async () => {
      const res = await updateCollaboratorRole(documentId, collaboratorId, newRole);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success("Role updated");
        fetchCollaborators();
      }
    });
  };

  const handleRemove = async (collaboratorId: string, name: string) => {
    startTransition(async () => {
      const res = await removeCollaborator(documentId, collaboratorId);
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success(`Removed ${name}`);
        fetchCollaborators();
      }
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/documents/${documentId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Share Document</DialogTitle>
              <DialogDescription className="text-xs truncate max-w-[280px]">
                {documentTitle || "Untitled Document"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Invite Form */}
          {isOwner && (
            <form onSubmit={handleInvite} className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Invite by email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  disabled={isPending}
                />
              </div>

              <Select
                value={role}
                onValueChange={(val: "viewer" | "editor") => setRole(val)}
                disabled={isPending}
              >
                <SelectTrigger className="w-[100px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="submit"
                size="sm"
                className="h-9 cursor-pointer"
                disabled={isPending || !email.trim()}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Invite</span>
              </Button>
            </form>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Who has access
            </h4>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading collaborators...
                </div>
              ) : collaborators.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No collaborators added yet. Invite people above!
                </div>
              ) : (
                collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.user.image || ""} />
                        <AvatarFallback className="text-xs">
                          {c.user.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-snug">
                          {c.user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOwner ? (
                        <>
                          <Select
                            value={c.role}
                            onValueChange={(val: "viewer" | "editor") =>
                              handleRoleChange(c.id, val)
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-[86px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemove(c.id, c.user.name)}
                            disabled={isPending}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] capitalize">
                          {c.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Share Link Row */}
          <div className="pt-2 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>Only invited people can access</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs h-8 cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
