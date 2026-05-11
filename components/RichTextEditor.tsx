'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, List, ListOrdered, Link2, Minus,
  Heading2, Heading3, Table as TableIcon, Undo, Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, code: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener' } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'rte-content' },
    },
  });

  // Sync external value changes (e.g. page switch)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href ?? '';
    const url = window.prompt('Link URL:', prev);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, title: string, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      className={`rte-btn${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        {btn(editor.isActive('bold'), 'Félkövér', () => editor.chain().focus().toggleBold().run(), <Bold size={14} />)}
        {btn(editor.isActive('italic'), 'Dőlt', () => editor.chain().focus().toggleItalic().run(), <Italic size={14} />)}
        <span className="rte-sep" />
        {btn(editor.isActive('heading', { level: 2 }), 'Főcím', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={14} />)}
        {btn(editor.isActive('heading', { level: 3 }), 'Alcím', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={14} />)}
        <span className="rte-sep" />
        {btn(editor.isActive('bulletList'), 'Felsorolás', () => editor.chain().focus().toggleBulletList().run(), <List size={14} />)}
        {btn(editor.isActive('orderedList'), 'Számozott lista', () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={14} />)}
        <span className="rte-sep" />
        {btn(editor.isActive('link'), 'Link', setLink, <Link2 size={14} />)}
        {btn(false, 'Vízszintes elválasztó', () => editor.chain().focus().setHorizontalRule().run(), <Minus size={14} />)}
        <span className="rte-sep" />
        {btn(false, 'Táblázat beszúrása', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), <TableIcon size={14} />)}
        <span className="rte-sep" />
        {btn(false, 'Visszavonás', () => editor.chain().focus().undo().run(), <Undo size={14} />)}
        {btn(false, 'Újra', () => editor.chain().focus().redo().run(), <Redo size={14} />)}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
