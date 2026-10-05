"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TableMap } from "@tiptap/pm/tables";
import { Markdown } from "tiptap-markdown";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Undo2,
} from "lucide-react";

type Props = {
  /** Markdown. Only read on mount - remount (change `key`) to load a different article. */
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  /** Called with the live editor once it exists (and with null when it unmounts). */
  onEditor?: (editor: Editor | null) => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type Format = "paragraph" | `h${HeadingLevel}`;
const HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

type Align = "left" | "center" | "right";

// Column alignment lives on the table cells and is saved in Markdown as the
// `:---:` / `---:` / `:---` delimiter row, so it survives Save and the public page.
const alignAttribute = {
  align: {
    default: null as Align | null,
    parseHTML: (element: HTMLElement) => (element.style.textAlign || element.getAttribute("align") || null) as Align | null,
    renderHTML: (attributes: { align?: Align | null }) => (attributes.align ? { style: `text-align: ${attributes.align}` } : {}),
  },
};

const AlignedTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...alignAttribute };
  },
});

const AlignedTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...alignAttribute };
  },
});

// Same as tiptap-markdown's own table serializer, but the delimiter row
// carries each column's alignment.
const AlignedTable = Table.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const aligns: (Align | null)[] = [];
          node.firstChild?.forEach((cell: any) => aligns.push(cell.attrs.align ?? null));
          state.inTable = true;
          node.forEach((row: any, _offset: number, rowIndex: number) => {
            state.write("| ");
            row.forEach((cell: any, _cellOffset: number, cellIndex: number) => {
              if (cellIndex) state.write(" | ");
              const content = cell.firstChild;
              if (content && content.textContent.trim()) state.renderInline(content);
            });
            state.write(" |");
            state.ensureNewLine();
            if (!rowIndex) {
              const delimiter = aligns.map((a) => (a === "center" ? ":---:" : a === "right" ? "---:" : a === "left" ? ":---" : "---")).join(" | ");
              state.write(`| ${delimiter} |`);
              state.ensureNewLine();
            }
          });
          state.closeBlock(node);
          state.inTable = false;
        },
        parse: {
          // handled by markdown-it
        },
      },
    };
  },
});

/** Sets the alignment of every cell in the column the cursor is in. */
function setColumnAlign(editor: Editor, align: Align) {
  const { state, view } = editor;
  const { $from } = state.selection;
  let tableDepth = -1;
  let cellDepth = -1;
  for (let depth = $from.depth; depth > 0; depth--) {
    const role = $from.node(depth).type.spec.tableRole;
    if ((role === "cell" || role === "header_cell") && cellDepth < 0) cellDepth = depth;
    if (role === "table") {
      tableDepth = depth;
      break;
    }
  }
  if (tableDepth < 0 || cellDepth < 0) return;

  const table = $from.node(tableDepth);
  const tableStart = $from.start(tableDepth);
  const map = TableMap.get(table);
  const { left } = map.findCell($from.before(cellDepth) - tableStart);
  const tr = state.tr;
  for (let row = 0; row < map.height; row++) {
    const pos = map.map[row * map.width + left];
    const cell = table.nodeAt(pos);
    if (cell) tr.setNodeMarkup(tableStart + pos, null, { ...cell.attrs, align });
  }
  view.dispatch(tr);
}

function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
}

export function countWords(markdown: string) {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40 ${
        active ? "bg-indigo-50 text-indigo-700" : ""
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      format: ((level) => (level ? `h${level}` : "paragraph"))(HEADING_LEVELS.find((l) => e.isActive("heading", { level: l }))) as Format,
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      code: e.isActive("code"),
      codeBlock: e.isActive("codeBlock"),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
      cellAlign: ((e.getAttributes("tableCell").align ?? e.getAttributes("tableHeader").align) ?? null) as Align | null,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function setFormat(format: Format) {
    const chain = editor.chain().focus();
    if (format === "paragraph") chain.setParagraph().run();
    else chain.setHeading({ level: Number(format.slice(1)) as HeadingLevel }).run();
  }

  function setLink() {
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link URL (leave empty to remove the link)", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function addImage() {
    const src = window.prompt("Image URL (https://...)");
    if (!src || !src.trim()) return;
    const alt = window.prompt("Image description (alt text, good for SEO)") ?? "";
    editor.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
  }

  const [tableOpen, setTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");

  function insertTable() {
    const rows = Math.min(30, Math.max(1, Number(tableRows) || 3));
    const cols = Math.min(10, Math.max(1, Number(tableCols) || 3));
    // The first row is a header row - Markdown tables always have one.
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableOpen(false);
  }

  const divider = <span className="mx-1 h-5 w-px bg-slate-200" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <select
        aria-label="Text style"
        value={state.format}
        onChange={(e) => setFormat(e.target.value as Format)}
        className="mr-1 h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
      >
        <option value="paragraph">Normal</option>
        {HEADING_LEVELS.map((level) => (
          <option key={level} value={`h${level}`}>
            Heading {level}
          </option>
        ))}
      </select>
      <ToolbarButton label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={16} />
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Bullet list" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} />
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Link" active={state.link} onClick={setLink}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={addImage}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <div className="relative">
        <ToolbarButton label="Insert table" active={state.inTable || tableOpen} onClick={() => setTableOpen((open) => !open)}>
          <TableIcon size={16} />
        </ToolbarButton>
        {tableOpen && (
          <div className="absolute left-0 top-9 z-20 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 text-xs font-medium text-slate-700">Insert table</div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <label>
                Rows
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label>
                Columns
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={insertTable} className="flex-1 rounded-md bg-indigo-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                Insert
              </button>
              <button type="button" onClick={() => setTableOpen(false)} className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <ToolbarButton label="Inline code" active={state.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton label="Code block" active={state.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 size={16} />
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={16} />
      </ToolbarButton>
      {state.inTable && (
        <div className="mt-1 flex w-full flex-wrap items-center gap-1 border-t border-slate-200 pt-1.5 text-xs">
          <span className="mr-1 font-medium text-slate-500">Table:</span>
          {(
            [
              ["+ Row above", () => editor.chain().focus().addRowBefore().run(), editor.can().addRowBefore()],
              ["+ Row below", () => editor.chain().focus().addRowAfter().run(), editor.can().addRowAfter()],
              ["+ Column left", () => editor.chain().focus().addColumnBefore().run(), editor.can().addColumnBefore()],
              ["+ Column right", () => editor.chain().focus().addColumnAfter().run(), editor.can().addColumnAfter()],
              ["Delete row", () => editor.chain().focus().deleteRow().run(), editor.can().deleteRow()],
              ["Delete column", () => editor.chain().focus().deleteColumn().run(), editor.can().deleteColumn()],
            ] as const
          ).map(([label, action, enabled]) => (
            <button
              key={label}
              type="button"
              disabled={!enabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={action}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              {label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <span className="mr-0.5 font-medium text-slate-500">Align column:</span>
          {(
            [
              ["left", "Align column left", <AlignLeft key="l" size={15} />],
              ["center", "Center column text", <AlignCenter key="c" size={15} />],
              ["right", "Align column right", <AlignRight key="r" size={15} />],
            ] as const
          ).map(([value, label, icon]) => (
            <ToolbarButton key={value} label={label} active={state.cellAlign === value} onClick={() => setColumnAlign(editor, value)}>
              {icon}
            </ToolbarButton>
          ))}
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="rounded-md border border-red-200 bg-white px-2 py-1 text-red-600 hover:bg-red-50"
          >
            Delete table
          </button>
        </div>
      )}
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, onEditor }: Props) {
  const editor = useEditor({
    immediatelyRender: false, // Next.js: avoid a server/client HTML mismatch
    extensions: [
      // StarterKit v3 already bundles Link; Markdown can't represent underline, so it is left out.
      StarterKit.configure({ underline: false, link: { openOnClick: false, autolink: true } }),
      Image,
      AlignedTable.configure({ resizable: false }),
      TableRow,
      AlignedTableHeader,
      AlignedTableCell,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing your article..." }),
      Markdown.configure({ html: false, tightLists: true, linkify: false, breaks: false }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "blog-editor-content min-h-[420px] px-4 py-3 focus:outline-none" },
    },
    onUpdate: ({ editor: e }) => onChange(getMarkdown(e)),
  });

  useEffect(() => {
    onEditor?.(editor);
    return () => onEditor?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => () => editor?.destroy(), [editor]);

  if (!editor) return <div className="min-h-[460px] rounded-md border border-slate-300 bg-white" />;

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
