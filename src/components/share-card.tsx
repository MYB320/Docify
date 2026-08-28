"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Lock,
  Trash2,
  UserPlus,
  Users,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareCardProps {
  documentId: string | null;
  documentTitle: string;
  isOwner: boolean;
}

export function ShareCard({
  documentId,
  documentTitle,
  isOwner,
}: ShareCardProps) {
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
    if (documentId) {
      fetchCollaborators();
    }
  }, [documentId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId || !email.trim()) return;

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
    if (!documentId) return;
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
    if (!documentId) return;
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
    if (!documentId) {
      toast.info("Save document first to share link");
      return;
    }
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/documents/${documentId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Share & Collaborate</CardTitle>
              <CardDescription className="text-xs">
                Manage access and invite teammates
              </CardDescription>
            </div>
          </div>

          {documentId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {!documentId ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              Save this new document once to invite collaborators and share access.
            </span>
          </div>
        ) : (
          <>
            {/* Invite Form */}
            {isOwner && (
              <form onSubmit={handleInvite} className="flex gap-1.5 items-center">
                <Input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs flex-1 bg-muted/20"
                  disabled={isPending}
                />

                <Select
                  value={role}
                  onValueChange={(val: "viewer" | "editor") => setRole(val)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[85px] h-8 text-xs">
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
                  className="h-8 px-2.5 text-xs cursor-pointer gap-1"
                  disabled={isPending || !email.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  <span>Invite</span>
                </Button>
              </form>
            )}

            {/* Collaborators List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>Who has access</span>
                <span>{collaborators.length} invited</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                {loading ? (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Loading collaborators...
                  </div>
                ) : collaborators.length === 0 ? (
                  <div className="text-center py-3 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No collaborators yet. Invite teammates above.
                  </div>
                ) : (
                  collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={c.user.image || ""} />
                          <AvatarFallback className="text-[10px]">
                            {c.user.name?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate leading-tight">
                            {c.user.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {c.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isOwner ? (
                          <>
                            <Select
                              value={c.role}
                              onValueChange={(val: "viewer" | "editor") =>
                                handleRoleChange(c.id, val)
                              }
                              disabled={isPending}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-[75px] px-1.5">
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
                              className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] capitalize h-5">
                            {c.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              <span>Only invited members can view or edit</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
