'use client';

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { JSX, useEffect } from "react";

interface Props {
  content?: string; //HTML coming from DB
  onChange?: (html: string) => void
}

/**
 * A react component that renders a tiptap editor.
 * It takes in two props: content, which is the initial html content of the editor,
 * and onChange, which is a function that is called whenever the content of the editor changes.
 *
 * @param {string} content - The initial html content of the editor.
 * @param {function} onChange - A function that is called whenever the content of the editor changes.
 * @returns {JSX.Element} - A JSX element representing the tiptap editor.
 */
export default function Editor({ content = '', onChange }: Props): JSX.Element {
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