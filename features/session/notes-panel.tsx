"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { cn, debounce } from "@/lib/utils";

const lowlight = createLowlight(common);

const NOTES_PLACEHOLDER = "Your private notes for this session…";

type SaveStatus = "idle" | "saving" | "saved";

export function NotesPanel({
  sessionId,
  onCollapse,
}: {
  sessionId: string;
  /** Collapse the notes strip (session layout). */
  onCollapse?: () => void;
}) {
  const [loadedHtml, setLoadedHtml] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const allowAutosaveRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const note = await api.sessions.getNote(sessionId);
        if (!cancelled) setLoadedHtml(note.content ?? "");
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
          setLoadedHtml("");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const debouncedSave = useMemo(
    () =>
      debounce((html: string) => {
        setSaveStatus("saving");
        api.sessions
          .upsertNote(sessionId, { content: html })
          .then(() => {
            setSaveStatus("saved");
            globalThis.setTimeout(() => setSaveStatus("idle"), 1800);
          })
          .catch((err: unknown) => {
            setSaveStatus("idle");
            const msg =
              err instanceof ApiError
                ? err.message
                : "Could not save notes";
            toast.error("Notes not saved", { description: msg });
          });
      }, 1000),
    [sessionId],
  );

  const debouncedSaveRef = useRef(debouncedSave);
  debouncedSaveRef.current = debouncedSave;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          link: {
            openOnClick: false,
            autolink: true,
            HTMLAttributes: {
              class: "text-sky-400 underline underline-offset-2",
            },
          },
        }),
        CodeBlockLowlight.configure({ lowlight }),
        Placeholder.configure({
          placeholder: NOTES_PLACEHOLDER,
        }),
        Typography,
        TaskList,
        TaskItem.configure({ nested: true }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class: cn(
            "prose-notes-editor max-w-none focus:outline-none",
            "min-h-[120px] px-3 py-2.5 text-[13px] leading-relaxed",
            "text-[#E5E7EB] caret-[#93C5FD]",
          ),
        },
      },
      onUpdate: ({ editor: ed }) => {
        if (!allowAutosaveRef.current) return;
        debouncedSaveRef.current(ed.getHTML());
      },
    },
    [sessionId],
  );

  useEffect(() => {
    if (!editor || loadedHtml === null) return;
    allowAutosaveRef.current = false;
    editor.commands.setContent(loadedHtml || "");
    requestAnimationFrame(() => {
      allowAutosaveRef.current = true;
    });
  }, [editor, loadedHtml]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = globalThis.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }, [editor]);

  return (
    <div className="flex size-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/5 bg-[#0D1117]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <HugeiconsIcon
            icon={LockIcon}
            size={14}
            strokeWidth={2}
            className="shrink-0 text-[#6B7280]"
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Notes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-[10px] text-[#6B7280]">Saving…</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-500/90">Saved</span>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-[#6B7280] transition-colors hover:bg-white/5 hover:text-[#9CA3AF]"
            >
              Hide
            </button>
          )}
        </div>
      </div>
      <p className="shrink-0 px-3 pb-1 text-[10px] text-[#6B7280]">
        Only visible to you
      </p>
      {loadFailed && (
        <p className="shrink-0 px-3 pb-1 text-[10px] text-amber-500/90">
          Could not load saved notes — you can still write; we&apos;ll try to save.
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {editor && (
          <NotesBubbleMenu editor={editor} onLink={setLink} />
        )}
        <EditorContent editor={editor} className="notes-tiptap-content" />
      </div>
    </div>
  );
}

function NotesBubbleMenu({
  editor,
  onLink,
}: {
  editor: Editor;
  onLink: () => void;
}) {
  const { bold, italic, code, link } = useEditorState({
    editor,
    selector: (snapshot) => ({
      bold: snapshot.editor.isActive("bold"),
      italic: snapshot.editor.isActive("italic"),
      code: snapshot.editor.isActive("code"),
      link: snapshot.editor.isActive("link"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-md border border-white/10 bg-[#161B22] p-1 shadow-lg"
    >
      <MenuBtn
        active={bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        B
      </MenuBtn>
      <MenuBtn
        active={italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        I
      </MenuBtn>
      <MenuBtn
        active={code}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="Code"
      >
        {"</>"}
      </MenuBtn>
      <MenuBtn active={link} onClick={onLink} label="Link">
        Link
      </MenuBtn>
    </BubbleMenu>
  );
}

function MenuBtn({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-[11px] font-medium text-[#E5E7EB] transition-colors",
        active ? "bg-white/15 text-white" : "hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
