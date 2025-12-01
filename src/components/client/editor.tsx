'use client';

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useEffect } from "react";

interface Props {
  content?: string; //HTML coming from DB
  onChange?: (html: string) => void
}

export default function Editor({ content = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    }
  })

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor]);

  return (
    <div className="border rounded p-2 min-h-[200px]">
      <EditorContent editor={editor}/>
    </div>
  );
}