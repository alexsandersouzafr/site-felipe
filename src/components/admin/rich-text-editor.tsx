"use client";

import {
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBIcon,
  TextHIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import type { RichTextDocument } from "@/lib/rich-text";
import { emptyRichTextDocument } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name?: string;
  label?: string;
  initialContent?: RichTextDocument | null;
  onChange?: (document: RichTextDocument) => void;
  placeholder?: string;
};

export function RichTextEditor({
  name,
  label,
  initialContent,
  onChange,
  placeholder = "Escreva o conteúdo...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent ?? emptyRichTextDocument,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange?.(current.getJSON() as RichTextDocument);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-3 py-2 outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    if (!editor || onChange || !initialContent) {
      return;
    }

    editor.commands.setContent(initialContent);
  }, [editor, initialContent, onChange]);

  const json = (editor?.getJSON() as RichTextDocument) ?? emptyRichTextDocument;

  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-medium" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "rounded-2xl border border-input bg-transparent",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        )}
      >
        <div className="flex flex-wrap gap-1 border-b border-border/70 px-2 py-2">
          <ToolbarButton
            label="Negrito"
            icon={<TextBIcon className="size-4" weight="bold" />}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
          />
          <ToolbarButton
            label="Itálico"
            icon={<TextItalicIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
          />
          <ToolbarButton
            label="Sublinhado"
            icon={<TextUnderlineIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
          />
          <ToolbarButton
            label="Tachado"
            icon={<TextStrikethroughIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Título"
            icon={<TextHIcon className="size-4" />}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor?.isActive("heading", { level: 2 })}
          />
          <ToolbarButton
            label="Lista com marcadores"
            icon={<ListBulletsIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
          />
          <ToolbarButton
            label="Lista numerada"
            icon={<ListNumbersIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
          />
          <ToolbarButton
            label="Citação"
            icon={<QuotesIcon className="size-4" />}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
          />
        </div>
        <EditorContent editor={editor} id={name} />
      </div>
      {name ? (
        <input type="hidden" name={name} value={JSON.stringify(json)} />
      ) : null}
    </div>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px self-center bg-border" aria-hidden />;
}

function ToolbarButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-xl transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}
