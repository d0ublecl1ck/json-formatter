"use client";

import * as React from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  ArrowDownAZ,
  ChevronDown,
  ChevronUp,
  Copy,
  Eraser,
  FoldVertical,
  Maximize2,
  Minimize2,
  ScanSearch,
  Shrink,
  UnfoldVertical,
} from "lucide-react";
import { toast } from "sonner";

import {
  getRootItemCount,
  parseJsonText,
  removeJsonEscapes,
  sortJsonKeys,
  stringifyMinified,
  stringifyPretty,
  type JsonValue,
} from "@/lib/json";
import { cn } from "@/lib/utils";
import { MonacoJsonEditor, type StandaloneCodeEditor } from "@/components/json/MonacoJsonEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_COLLAPSE_LEVEL = 5;
const MAX_COLLAPSE_LEVEL = 7;

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function iconButtonVariant(active: boolean) {
  return active ? "secondary" : "ghost";
}

export function JsonFormatterApp() {
  const [input, setInput] = React.useState("");
  const [rawValue, setRawValue] = React.useState<JsonValue | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchCount, setSearchCount] = React.useState(0);
  const [searchIndex, setSearchIndex] = React.useState(0);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const [sortEnabled, setSortEnabled] = React.useState(false);
  const [collapseEnabled, setCollapseEnabled] = React.useState(false);
  const [collapseLevel, setCollapseLevel] = React.useState<number>(DEFAULT_COLLAPSE_LEVEL);
  const [collapseLevelText, setCollapseLevelText] = React.useState(
    String(DEFAULT_COLLAPSE_LEVEL),
  );

  const [monacoTheme, setMonacoTheme] = React.useState<"vs" | "vs-dark">("vs");

  const outputEditorRef = React.useRef<StandaloneCodeEditor | null>(null);

  const collapseEnabledRef = React.useRef(collapseEnabled);
  React.useEffect(() => {
    collapseEnabledRef.current = collapseEnabled;
  }, [collapseEnabled]);

  const searchDecorationsRef = React.useRef<string[]>([]);
  const searchMatchesRef = React.useRef<MonacoEditor.FindMatch[]>([]);

  const displayValue = React.useMemo(() => {
    if (rawValue === undefined) return undefined;
    return sortEnabled ? sortJsonKeys(rawValue) : rawValue;
  }, [rawValue, sortEnabled]);

  const formattedText = React.useMemo(() => {
    if (displayValue === undefined) return "";
    return stringifyPretty(displayValue);
  }, [displayValue]);

  const rootItemCount = React.useMemo(() => {
    if (displayValue === undefined) return null;
    return getRootItemCount(displayValue);
  }, [displayValue]);

  const parseAndUpdate = React.useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setRawValue(undefined);
      setError(null);
      return;
    }

    const result = parseJsonText(trimmed);
    if ("error" in result) {
      setError(result.error);
      setRawValue(undefined);
      return;
    }

    setError(null);
    setRawValue(result.value);
  }, []);

  const commitCollapseLevelText = React.useCallback(() => {
    const raw = collapseLevelText.trim();
    if (!raw) {
      setCollapseLevelText(String(collapseLevel));
      return;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      setCollapseLevelText(String(collapseLevel));
      return;
    }

    const next = Math.min(MAX_COLLAPSE_LEVEL, Math.max(1, parsed));
    setCollapseLevel(next);
    setCollapseLevelText(String(next));
  }, [collapseLevel, collapseLevelText]);

  const normalizedCollapseLevel = React.useCallback(() => {
    const raw = collapseLevelText.trim();
    if (!raw) return collapseLevel;

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return collapseLevel;

    return Math.min(MAX_COLLAPSE_LEVEL, Math.max(1, parsed));
  }, [collapseLevel, collapseLevelText]);

  const adjustCollapseLevel = React.useCallback(
    (delta: -1 | 1) => {
      const current = normalizedCollapseLevel();
      const next = Math.min(MAX_COLLAPSE_LEVEL, Math.max(1, current + delta));
      setCollapseLevel(next);
      setCollapseLevelText(String(next));
    },
    [normalizedCollapseLevel],
  );

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      parseAndUpdate(input);
    }, 200);
    return () => window.clearTimeout(id);
  }, [input, parseAndUpdate]);

  React.useEffect(() => {
    setCollapseLevelText(String(collapseLevel));
  }, [collapseLevel]);

  const handleRemoveEscapes = React.useCallback(() => {
    const { text, changed } = removeJsonEscapes(input);
    if (!changed) {
      toast("未检测到可去除的转义");
      return;
    }
    setInput(text);
    const trimmed = text.trim();
    if (!trimmed) {
      setRawValue(undefined);
      setError(null);
      toast.success("已去除转义并回填");
      return;
    }

    const result = parseJsonText(trimmed);
    if ("error" in result) {
      setError(result.error);
      setRawValue(undefined);
      toast.error("去除转义后仍无法解析", { description: result.error });
      return;
    }

    setError(null);
    setRawValue(result.value);
    toast.success("已去除转义并格式化");
  }, [input]);

  const handleCopy = React.useCallback(async () => {
    if (displayValue === undefined) return;
    try {
      await copyToClipboard(formattedText);
      toast.success("已复制");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Copy failed";
      toast.error("复制失败", { description: message });
    }
  }, [displayValue, formattedText]);

  const handleCompress = React.useCallback(() => {
    if (displayValue === undefined) return;
    setInput(stringifyMinified(displayValue));
    toast.success("已压缩并回填到左侧");
  }, [displayValue]);

  const handleToggleFullScreen = React.useCallback(() => {
    if (displayValue === undefined) {
      toast("请先格式化 JSON");
      return;
    }
    setIsFullScreen((prev) => !prev);
  }, [displayValue]);

  const handleClear = React.useCallback(() => {
    setInput("");
    setRawValue(undefined);
    setError(null);
    setSearchQuery("");
    setSearchCount(0);
    setSearchIndex(0);
    setIsFullScreen(false);
    setSortEnabled(false);
    setCollapseEnabled(false);
    setCollapseLevel(DEFAULT_COLLAPSE_LEVEL);
    setCollapseLevelText(String(DEFAULT_COLLAPSE_LEVEL));
  }, []);

  const unfoldAll = React.useCallback(async () => {
    const editor = outputEditorRef.current;
    if (!editor) return;

    editor.focus();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const unfold = editor.getAction("editor.unfoldAll");
    if (!unfold) {
      toast.error("展开失败", { description: "编辑器未就绪" });
      return;
    }
    await unfold.run();
  }, []);

  const foldToLevel = React.useCallback(async (level: number) => {
    const editor = outputEditorRef.current;
    if (!editor) return;

    editor.focus();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const unfold = editor.getAction("editor.unfoldAll");
    if (!unfold) {
      toast.error("折叠失败", { description: "编辑器未就绪" });
      return;
    }
    await unfold.run();

    const nextLevel = Math.min(Math.max(level, 1), MAX_COLLAPSE_LEVEL);
    const foldLevel = editor.getAction(`editor.foldLevel${nextLevel}`);
    await (foldLevel ?? editor.getAction("editor.foldAll"))?.run();
  }, []);

  const handleFold = React.useCallback(() => {
    if (displayValue === undefined) return;
    setCollapseEnabled(true);
    void foldToLevel(collapseLevel);
  }, [collapseLevel, displayValue, foldToLevel]);

  const handleUnfold = React.useCallback(() => {
    if (displayValue === undefined) return;
    setCollapseEnabled(false);
    void unfoldAll();
  }, [displayValue, unfoldAll]);

  const jumpToMatch = React.useCallback(
    (direction: 1 | -1) => {
      const editor = outputEditorRef.current;
      const matches = searchMatchesRef.current;
      if (!editor || matches.length === 0) return;

      setSearchIndex((prev) => {
        const next = (prev + direction + matches.length) % matches.length;
        const range = matches[next].range;
        editor.setSelection(range);
        editor.revealRangeInCenter(range);
        editor.focus();
        return next;
      });
    },
    [],
  );

  React.useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const update = () => setMonacoTheme(mql.matches ? "vs-dark" : "vs");
    update();

    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  React.useEffect(() => {
    if (displayValue !== undefined) return;
    setIsFullScreen(false);
    outputEditorRef.current = null;
    searchDecorationsRef.current = [];
    searchMatchesRef.current = [];
  }, [displayValue]);

  React.useEffect(() => {
    if (displayValue === undefined) return;
    if (!collapseEnabledRef.current) return;
    void foldToLevel(collapseLevel);
  }, [collapseLevel, displayValue, foldToLevel, formattedText]);

  React.useEffect(() => {
    const editor = outputEditorRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    const query = searchQuery.trim();
    if (!query) {
      searchDecorationsRef.current = editor.deltaDecorations(
        searchDecorationsRef.current,
        [],
      );
      searchMatchesRef.current = [];
      setSearchCount(0);
      setSearchIndex(0);
      return;
    }

    const matches = model.findMatches(query, false, false, false, null, true);
    searchMatchesRef.current = matches;
    setSearchCount(matches.length);
    setSearchIndex((prev) => Math.min(prev, Math.max(0, matches.length - 1)));

    const nextDecorations = matches.map((m) => ({
      range: m.range,
      options: { inlineClassName: "monaco-search-highlight" },
    }));
    searchDecorationsRef.current = editor.deltaDecorations(
      searchDecorationsRef.current,
      nextDecorations,
    );
  }, [formattedText, searchQuery]);

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full flex-1 min-h-0 flex-col overflow-hidden px-4 py-4">
        <div
          className={cn(
            "flex flex-1 min-h-0 flex-col gap-4",
            isFullScreen ? "" : "lg:flex-row",
          )}
        >
          {!isFullScreen ? (
            <Card className="flex min-h-0 min-w-0 flex-1 flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">输入</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
                <MonacoJsonEditor
                  value={input}
                  onChange={setInput}
                  theme={monacoTheme}
                  ariaLabel="JSON 输入"
                />
                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleClear}>
                      清空
                    </Button>
                  </div>
                  {error ? (
                    <p className="text-sm text-destructive">
                      {error}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      自动格式化；不会上传数据，所有处理均在本地完成
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="flex min-h-0 min-w-0 flex-1 flex-col">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">输出</CardTitle>
                  {rootItemCount != null ? (
                    <span className="text-xs text-muted-foreground">
                      {rootItemCount} items
                    </span>
                  ) : null}
                </div>

                <div className="flex max-w-full items-center gap-2 overflow-x-auto px-2 py-2 -mx-2">
                  <div className="relative">
                    <ScanSearch className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索"
                      className="w-40 shrink-0 pl-8 sm:w-44"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          jumpToMatch(e.shiftKey ? -1 : 1);
                        }
                      }}
                    />
                  </div>
                  {searchCount > 0 ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {searchIndex + 1}/{searchCount}
                    </span>
                  ) : null}

                  <Separator orientation="vertical" className="hidden h-8 sm:block" />

                  <Tooltip>
                  <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={iconButtonVariant(isFullScreen)}
                        onClick={handleToggleFullScreen}
                        disabled={displayValue === undefined}
                        aria-label="全屏"
                      >
                        {isFullScreen ? <Minimize2 /> : <Maximize2 />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>全屏</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={iconButtonVariant(displayValue !== undefined && collapseEnabled)}
                        onClick={handleFold}
                        disabled={displayValue === undefined}
                        aria-label="折叠"
                      >
                        <FoldVertical />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>折叠</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={iconButtonVariant(displayValue !== undefined && !collapseEnabled)}
                        onClick={handleUnfold}
                        disabled={displayValue === undefined}
                        aria-label="展开"
                      >
                        <UnfoldVertical />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>展开</TooltipContent>
                  </Tooltip>

                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1 transition-colors focus-within:border-ring focus-within:shadow-[inset_0_0_0_1px_var(--ring)]">
                    <span className="select-none text-xs text-muted-foreground">
                      层级
                    </span>
                    <Input
                      value={collapseLevelText}
                      onChange={(e) => setCollapseLevelText(e.target.value)}
                      onBlur={commitCollapseLevelText}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitCollapseLevelText();
                          e.currentTarget.blur();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setCollapseLevelText(String(collapseLevel));
                          e.currentTarget.blur();
                        }
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled={displayValue === undefined}
                      className="h-8 w-12 border-0 bg-transparent px-0 py-0 text-center shadow-none focus:shadow-none"
                      aria-label="折叠层级"
                    />

                    <div className="flex flex-col">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => adjustCollapseLevel(1)}
                        disabled={displayValue === undefined}
                        className="h-4 w-6 rounded-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]"
                        aria-label="层级加 1"
                      >
                        <ChevronUp className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => adjustCollapseLevel(-1)}
                        disabled={displayValue === undefined}
                        className="h-4 w-6 rounded-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]"
                        aria-label="层级减 1"
                      >
                        <ChevronDown className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleRemoveEscapes}
                        disabled={!input.trim()}
                        aria-label="去除转义"
                      >
                        <Eraser />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>去除转义</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={iconButtonVariant(sortEnabled)}
                        onClick={() => setSortEnabled((prev) => !prev)}
                        disabled={displayValue === undefined}
                        aria-label="排序"
                      >
                        <ArrowDownAZ />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>排序</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCompress}
                        disabled={displayValue === undefined}
                        aria-label="压缩"
                      >
                        <Shrink />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>压缩</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopy}
                        disabled={displayValue === undefined}
                        aria-label="复制"
                      >
                        <Copy />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>复制</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col">
              {displayValue === undefined ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      格式化后的 JSON 将显示在这里
                    </p>
                    <p className="text-xs text-muted-foreground">
                      右上角工具支持搜索、全屏、折叠/展开、排序、压缩与复制
                    </p>
                  </div>
                </div>
              ) : (
                  <MonacoJsonEditor
                  value={formattedText}
                  readOnly
                  theme={monacoTheme}
                  ariaLabel="JSON 输出"
                  onMount={(editor) => {
                    outputEditorRef.current = editor;
                    if (collapseEnabledRef.current) {
                      void foldToLevel(collapseLevel);
                    }
                  }}
                  options={{
                    readOnly: true,
                    domReadOnly: true,
                    wordWrap: "off",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
