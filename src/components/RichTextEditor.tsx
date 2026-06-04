import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading2, Heading3, Quote, Undo, Redo,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Write your post…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[280px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // sync external value changes (e.g. when loading existing post)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const Btn = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 px-2"
      onClick={on}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="h-4 w-4" /></Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="h-4 w-4" /></Btn>
        <Btn label="Heading 2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="h-4 w-4" /></Btn>
        <Btn label="Heading 3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="h-4 w-4" /></Btn>
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="h-4 w-4" /></Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="h-4 w-4" /></Btn>
        <Btn label="Link" on={setLink} active={editor.isActive("link")}><LinkIcon className="h-4 w-4" /></Btn>
        <div className="ml-auto flex gap-0.5">
          <Btn label="Undo" on={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Btn>
          <Btn label="Redo" on={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Btn>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}