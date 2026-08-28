"use client";

import { useState, useTransition } from "react";
import { Editor } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Check,
  RotateCcw,
  Languages,
  Wand2,
  ListRestart,
  ArrowDownToLine,
  Replace,
  Loader2,
  Copy,
  ChevronRight,
  Maximize2,
  Minimize2,
  Smile,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateAiContent, AiAction } from "@/server/ai";
import { toast } from "sonner";

interface AiAssistantProps {
  editor: TiptapEditor | Editor | null;
  onClose?: () => void;
  className?: string;
}

export function AiAssistant({ editor, onClose, className }: AiAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, startTransition] = useTransition();
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [currentActionLabel, setCurrentActionLabel] = useState<string>("");

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    if (from === to) {
      // If nothing selected, take whole document text
      return editor.getText();
    }
    return editor.state.doc.textBetween(from, to, " ");
  };

  const handleAiAction = (
    action: AiAction,
    options?: {
      tone?: "professional" | "casual" | "academic" | "friendly" | "persuasive";
      language?: string;
      customPrompt?: string;
      label?: string;
    }
  ) => {
    const text = getSelectedText();
    if (!text.trim()) {
      toast.error("Please write or select some text in the editor first.");
      return;
    }

    setCurrentActionLabel(options?.label || action);

    startTransition(async () => {
      const res = await generateAiContent({
        action,
        text,
        tone: options?.tone,
        language: options?.language,
        customPrompt: options?.customPrompt,
      });

      if (res.error) {
        toast.error(res.error.message);
      } else if (res.result) {
        setGeneratedResult(res.result);
      }
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    handleAiAction("custom", {
      customPrompt: customPrompt.trim(),
      label: `Custom: "${customPrompt.trim()}"`,
    });
  };

  const handleReplaceSelection = () => {
    if (!generatedResult || !editor) return;
    const { from, to } = editor.state.selection;

    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(generatedResult).run();
    } else {
      editor.chain().focus().setContent(generatedResult).run();
    }

    toast.success("Text replaced with AI output");
    setGeneratedResult(null);
    setCustomPrompt("");
    onClose?.();
  };

  const handleInsertBelow = () => {
    if (!generatedResult || !editor) return;
    const { to } = editor.state.selection;
    editor.chain().focus().setTextSelection(to).insertContent(`\n${generatedResult}`).run();

    toast.success("AI output inserted below");
    setGeneratedResult(null);
    setCustomPrompt("");
    onClose?.();
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = generatedResult;
    navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || "");
    toast.success("AI output copied to clipboard");
  };

  return (
    <Card className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className || ""}`}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Gemini AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Write, rewrite, summarize & brainstorm
              </CardDescription>
            </div>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {!generatedResult ? (
          <>
            {/* Custom Prompt Form */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
              <Input
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask AI anything about your text..."
                className="h-8 text-xs flex-1 bg-muted/20"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isGenerating || !customPrompt.trim()}
                className="h-8 px-3 text-xs gap-1.5 cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                Generate
              </Button>
            </form>

            {/* Quick AI Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("improve", { label: "Improve writing" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Improve Writing</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("fix_grammar", { label: "Fix grammar" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Fix Grammar</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("summarize", { label: "Summarize" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <ListRestart className="h-3.5 w-3.5 text-blue-500" />
                  <span>Summarize</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("continue_writing", { label: "Continue writing" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Wand2 className="h-3.5 w-3.5 text-purple-500" />
                  <span>Continue Writing</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("make_longer", { label: "Expand" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
                  <span>Make Longer</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAiAction("make_shorter", { label: "Make shorter" })}
                  disabled={isGenerating}
                  className="h-7 text-xs justify-start gap-1.5 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Minimize2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>Make Shorter</span>
                </Button>

                {/* Tone Submenu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                      className="h-7 text-xs justify-between gap-1 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Smile className="h-3.5 w-3.5 text-purple-500" />
                        <span>Change Tone</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("change_tone", {
                          tone: "professional",
                          label: "Professional tone",
                        })
                      }
                    >
                      Professional
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("change_tone", {
                          tone: "casual",
                          label: "Casual tone",
                        })
                      }
                    >
                      Casual
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("change_tone", {
                          tone: "friendly",
                          label: "Friendly tone",
                        })
                      }
                    >
                      Friendly
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("change_tone", {
                          tone: "academic",
                          label: "Academic tone",
                        })
                      }
                    >
                      Academic
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("change_tone", {
                          tone: "persuasive",
                          label: "Persuasive tone",
                        })
                      }
                    >
                      Persuasive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Translate Submenu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                      className="h-7 text-xs justify-between gap-1 bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Translate</span>
                      </div>
                      <ChevronRight className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "English",
                          label: "Translate to English",
                        })
                      }
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "French",
                          label: "Translate to French",
                        })
                      }
                    >
                      French (Français)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "Spanish",
                          label: "Translate to Spanish",
                        })
                      }
                    >
                      Spanish (Español)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "German",
                          label: "Translate to German",
                        })
                      }
                    >
                      German (Deutsch)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "Arabic",
                          label: "Translate to Arabic",
                        })
                      }
                    >
                      Arabic (العربية)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAiAction("translate", {
                          language: "Japanese",
                          label: "Translate to Japanese",
                        })
                      }
                    >
                      Japanese (日本語)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isGenerating && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground animate-pulse border rounded-lg bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Gemini is generating response...</span>
              </div>
            )}
          </>
        ) : (
          /* Result Preview and Actions */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {currentActionLabel || "Generated Result"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className="h-6 w-6 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div
              className="max-h-56 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedResult }}
            />

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratedResult(null)}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Try Again
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedResult(null);
                    onClose?.();
                  }}
                  className="h-7 text-xs text-muted-foreground cursor-pointer"
                >
                  Discard
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertBelow}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  Insert
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReplaceSelection}
                  className="h-7 text-xs gap-1 cursor-pointer bg-primary text-primary-foreground"
                >
                  <Replace className="h-3 w-3" />
                  Replace
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
