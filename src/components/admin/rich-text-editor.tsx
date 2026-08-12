"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import type { RichTextDocument } from "@/lib/rich-text";
import { emptyRichTextDocument } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  label: string;
  initialContent?: RichTextDocument | null;
};

export function RichTextEditor({
  name,
  label,
  initialContent,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Escreva o conteúdo...",
      }),
    ],
    content: initialContent ?? emptyRichTextDocument,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-3 py-2 outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    if (!editor || !initialContent) {
      return;
    }

    editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  const json = editor?.getJSON() ?? emptyRichTextDocument;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <div
        className={cn(
          "rounded-2xl border border-input bg-transparent",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        )}
      >
        <div className="flex flex-wrap gap-1 border-b border-border/70 px-2 py-2">
          <ToolbarButton
            label="Negrito"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
          />
          <ToolbarButton
            label="Itálico"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
          />
          <ToolbarButton
            label="Título"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor?.isActive("heading", { level: 2 })}
          />
          <ToolbarButton
            label="Lista"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
          />
        </div>
        <EditorContent editor={editor} id={name} />
      </div>
      <input type="hidden" name={name} value={JSON.stringify(json)} />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-2 py-1 text-xs",
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
