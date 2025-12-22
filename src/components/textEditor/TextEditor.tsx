'use client';

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style"; 
import { Color } from "@tiptap/extension-color"; 

import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  QueueListIcon,
  CodeBracketIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  PhotoIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";

import ColorPickerButton from "../client/ColorPickerButton";

type TextEditorProps = {
  value?: unknown;
  onChange?: (content: unknown) => void;
};

export default function TextEditor({ value, onChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  if (!editor) {
    return <div className="border rounded-md p-2">Loading editor…</div>;
  }

  const buttonClass = (active: boolean) =>
    active ? "bg-gray-300 p-2 rounded" : "p-2 border rounded hover:bg-gray-100";

  return (
    <div className="border rounded-md p-2 space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          <BoldIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          <ItalicIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>

        {/* 👇 Palette flottante */}
        <ColorPickerButton editor={editor} />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          <ListBulletIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          <QueueListIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={buttonClass(editor.isActive("blockquote"))}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={buttonClass(editor.isActive("codeBlock"))}
        >
          <CodeBracketIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={buttonClass(editor.isActive("link"))}
        >
          <LinkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="p-2 border rounded hover:bg-gray-100"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
          }
          className="p-2 border rounded hover:bg-gray-100"
        >
          <TableCellsIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 border rounded hover:bg-gray-100"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 border rounded hover:bg-gray-100"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Zone éditable */}
      <EditorContent
        editor={editor}
        className="ProseMirror border rounded p-2 min-h-[200px]"
      />
    </div>
  );
}