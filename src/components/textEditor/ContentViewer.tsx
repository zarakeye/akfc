'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type CourseContentViewerProps = {
  content: JSON; // le JSON sauvegardé
};

export default function CourseContentViewer({ content }: CourseContentViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content, // 👈 on passe directement le JSON
    editable: false, // lecture seule
  });

  if (!editor) {
    return <div>Loading…</div>;
  }

  return (
    <div className="prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}