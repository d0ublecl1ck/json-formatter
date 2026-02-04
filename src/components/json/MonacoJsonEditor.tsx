"use client";

import * as React from "react";
import { Editor, loader, type Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";

import { cn } from "@/lib/utils";

// Avoid the default CDN and load Monaco from local static assets.
// `scripts/copy-monaco.mjs` copies `node_modules/monaco-editor/min/vs` -> `public/monaco/vs`.
if (typeof window !== "undefined") {
  loader.config({ paths: { vs: "/monaco/vs" } });
}

export type StandaloneCodeEditor = MonacoEditor.IStandaloneCodeEditor;

type MonacoJsonEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  theme: "vs" | "vs-dark";
  onMount?: (editor: StandaloneCodeEditor, monaco: Monaco) => void;
  className?: string;
  ariaLabel?: string;
  options?: MonacoEditor.IStandaloneEditorConstructionOptions;
};

const defaultOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  tabSize: 2,
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  lineHeight: 20,
  fontLigatures: true,
  wordWrap: "off",
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  renderLineHighlight: "line",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  folding: true,
  scrollbar: {
    useShadows: false,
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    verticalSliderSize: 8,
    horizontalSliderSize: 8,
  },
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
};

export function MonacoJsonEditor({
  value,
  onChange,
  readOnly,
  theme,
  onMount,
  className,
  ariaLabel,
  options,
}: MonacoJsonEditorProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-hidden rounded-lg border bg-background",
        className,
      )}
    >
      <Editor
        height="100%"
        width="100%"
        language="json"
        theme={theme}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        onMount={(editor, monaco) => onMount?.(editor, monaco)}
        options={{
          ...defaultOptions,
          ...options,
          readOnly: readOnly ?? options?.readOnly,
          ariaLabel,
        }}
      />
    </div>
  );
}
