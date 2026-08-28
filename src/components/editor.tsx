"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor as TiptapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  RemoveFormatting,
  Table as TableLucideIcon,
  Plus,
  Trash,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onEditorReady?: (editor: TiptapEditor | null) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function Editor({
  content = "",
  onChange,
  onEditorReady,
  placeholder = "Start writing your document here...",
  editable = true,
  className,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Notify parent of editor instance
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Keep content in sync if modified externally
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        Loading editor...
      </div>
    );
  }

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col relative",
          className
        )}
      >
        {/* Floating Bubble Menu on text selection */}
        {editable && editor && (
          <BubbleMenu
            editor={editor}
            className="flex items-center gap-1 bg-background/95 backdrop-blur-md border rounded-lg shadow-xl p-1 text-xs"
          >
            <Button
              type="button"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="h-7 w-7"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="h-7 w-7"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="h-7 w-7"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive("strike") ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="h-7 w-7"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className="h-7 w-7"
            >
              <Code className="h-3.5 w-3.5" />
            </Button>
          </BubbleMenu>
        )}

        {/* Editor Main Toolbar */}
        {editable && (
          <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2 backdrop-blur-sm">
            {/* Undo / Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  aria-label="Undo"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  aria-label="Redo"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Headings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("heading", { level: 1 })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  aria-label="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("heading", { level: 2 })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  aria-label="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("heading", { level: 3 })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  aria-label="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 3</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("bold") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  aria-label="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold (Ctrl+B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("italic") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  aria-label="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("underline") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  aria-label="Underline"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline (Ctrl+U)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("strike") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  aria-label="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Strikethrough</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("code") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  aria-label="Inline Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Inline Code</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Alignment */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive({ textAlign: "left" })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  aria-label="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive({ textAlign: "center" })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  aria-label="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive({ textAlign: "right" })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  aria-label="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive({ textAlign: "justify" })
                      ? "secondary"
                      : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  aria-label="Align Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Justify</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Lists & Blocks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  aria-label="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("orderedList") ? "secondary" : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  aria-label="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("blockquote") ? "secondary" : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  aria-label="Blockquote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Blockquote</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    editor.isActive("codeBlock") ? "secondary" : "ghost"
                  }
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().toggleCodeBlock().run()
                  }
                  aria-label="Code Block"
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>

            {/* Table Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("table") ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label="Table Menu"
                >
                  <TableLucideIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {!editor.isActive("table") ? (
                  <DropdownMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Insert 3x3 Table
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().addRowAfter().run()
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Row Below
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().addColumnAfter().run()
                      }
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" /> Add Column Right
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                      <Trash className="h-3.5 w-3.5 mr-2" /> Delete Row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().deleteColumn().run()
                      }
                    >
                      <Trash className="h-3.5 w-3.5 mr-2" /> Delete Column
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-3.5 w-3.5 mr-2" /> Delete Table
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  aria-label="Horizontal Divider"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Horizontal Divider</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            {/* Links & Clear */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={editor.isActive("link") ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={setLink}
                  aria-label="Insert Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Link</TooltipContent>
            </Tooltip>

            {editor.isActive("link") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    aria-label="Remove Link"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove Link</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    editor.chain().focus().clearNodes().unsetAllMarks().run()
                  }
                  aria-label="Clear Formatting"
                >
                  <RemoveFormatting className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear Formatting</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Editor Body */}
        <div
          className="flex-1 p-6 md:p-8 overflow-y-auto cursor-text min-h-[500px]"
          onClick={() => editor.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Live Document Stats Footer */}
        <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground no-print select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </span>

            <span>•</span>

            <span>
              {charCount} {charCount === 1 ? "character" : "characters"}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} min read</span>
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
