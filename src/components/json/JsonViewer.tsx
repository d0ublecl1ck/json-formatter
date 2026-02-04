"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { JsonValue } from "@/lib/json";
import { cn } from "@/lib/utils";

type JsonViewerProps = {
  value: JsonValue;
  collapsedPaths: ReadonlySet<string>;
  onToggleCollapsed: (path: string) => void;
  searchQuery: string;
  className?: string;
};

function isObject(value: JsonValue): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const haystack = text;
  const needle = query.trim();
  if (!needle) return haystack;

  const lowerHay = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();

  const parts: React.ReactNode[] = [];
  let from = 0;
  let matchIndex = 0;
  while (true) {
    const idx = lowerHay.indexOf(lowerNeedle, from);
    if (idx === -1) break;
    if (idx > from) {
      parts.push(haystack.slice(from, idx));
    }
    parts.push(
      <mark
        key={`${idx}-${matchIndex}`}
        className="rounded bg-yellow-200/70 px-0.5 text-foreground dark:bg-yellow-900/40"
      >
        {haystack.slice(idx, idx + needle.length)}
      </mark>,
    );
    from = idx + needle.length;
    matchIndex += 1;
  }
  if (from < haystack.length) {
    parts.push(haystack.slice(from));
  }
  return parts.length ? parts : haystack;
}

function formatPrimitive(value: Exclude<JsonValue, object>): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

function primitiveClassName(value: Exclude<JsonValue, object>): string {
  if (value === null) return "text-muted-foreground";
  if (typeof value === "string") return "text-emerald-600 dark:text-emerald-400";
  if (typeof value === "number") return "text-sky-600 dark:text-sky-400";
  if (typeof value === "boolean") return "text-fuchsia-600 dark:text-fuchsia-400";
  return "text-foreground";
}

type NodeProps = {
  value: JsonValue;
  path: string;
  depth: number;
  label?: string;
  labelType?: "key" | "index";
  isLast?: boolean;
  collapsedPaths: ReadonlySet<string>;
  onToggleCollapsed: (path: string) => void;
  searchQuery: string;
};

function JsonNode({
  value,
  path,
  depth,
  label,
  labelType = "key",
  isLast,
  collapsedPaths,
  onToggleCollapsed,
  searchQuery,
}: NodeProps) {
  const isComplex = value !== null && typeof value === "object";
  const isCollapsed = isComplex && collapsedPaths.has(path);
  const [renderChildren, setRenderChildren] = React.useState(!isCollapsed);
  const [animateOpen, setAnimateOpen] = React.useState(false);

  const indentStyle = { paddingLeft: `${depth * 16}px` };

  React.useEffect(() => {
    if (!isComplex) return;
    if (!isCollapsed) {
      setRenderChildren(true);
      return;
    }

    const timer = setTimeout(() => setRenderChildren(false), 180);
    return () => clearTimeout(timer);
  }, [isCollapsed, isComplex]);

  React.useEffect(() => {
    if (!animateOpen) return;
    if (isCollapsed) return;
    const id = requestAnimationFrame(() => setAnimateOpen(false));
    return () => cancelAnimationFrame(id);
  }, [animateOpen, isCollapsed]);

  if (!isComplex) {
    const primitive = value as Exclude<JsonValue, object>;
    return (
      <div style={indentStyle} className="flex items-start gap-2">
        {label != null ? (
          <span className="shrink-0 text-muted-foreground">
            {labelType === "index"
              ? `[${label}]`
              : highlightText(JSON.stringify(label), searchQuery)}
            <span className="text-muted-foreground">:</span>
          </span>
        ) : null}
        <span className={cn("break-all", primitiveClassName(primitive))}>
          {highlightText(formatPrimitive(primitive), searchQuery)}
          {!isLast ? <span className="text-muted-foreground">,</span> : null}
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const itemCount = isArray
    ? (value as JsonValue[]).length
    : Object.keys(value as Record<string, JsonValue>).length;
  const open = isArray ? "[" : "{";
  const close = isArray ? "]" : "}";
  const contentCollapsed = isCollapsed || animateOpen;
  const handleToggle = () => {
    if (isCollapsed) {
      setRenderChildren(true);
      setAnimateOpen(true);
    } else {
      setAnimateOpen(false);
    }
    onToggleCollapsed(path);
  };

  return (
    <div className="space-y-1">
      <div style={indentStyle} className="flex items-start gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className="mt-0.5 inline-flex size-5 items-center justify-center rounded hover:bg-accent"
          aria-label={isCollapsed ? "展开" : "折叠"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {label != null ? (
          <span className="shrink-0 text-muted-foreground">
            {labelType === "index"
              ? `[${label}]`
              : highlightText(JSON.stringify(label), searchQuery)}
            <span className="text-muted-foreground">:</span>
          </span>
        ) : null}

        <span className="text-muted-foreground">{open}</span>
        {isCollapsed ? (
          <span className="text-muted-foreground">
            <span className="mx-1">…</span>
            <span className="text-xs">{itemCount} items</span>
            <span className="text-muted-foreground">{close}</span>
            {!isLast ? <span className="text-muted-foreground">,</span> : null}
          </span>
        ) : (
          <span className="text-muted-foreground">
            <span className="text-xs">{itemCount} items</span>
          </span>
        )}
      </div>

      {renderChildren ? (
        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            contentCollapsed
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-1">
              {isArray
                ? (value as JsonValue[]).map((child, index, all) => (
                    <JsonNode
                      key={`${path}[${index}]`}
                      value={child}
                      path={`${path}[${index}]`}
                      depth={depth + 1}
                      label={String(index)}
                      labelType="index"
                      isLast={index === all.length - 1}
                      collapsedPaths={collapsedPaths}
                      onToggleCollapsed={onToggleCollapsed}
                      searchQuery={searchQuery}
                    />
                  ))
                : Object.entries(value as Record<string, JsonValue>).map(
                    ([key, child], index, all) => (
                      <JsonNode
                        key={`${path}.${key}`}
                        value={child}
                        path={`${path}.${key}`}
                        depth={depth + 1}
                        label={key}
                        labelType="key"
                        isLast={index === all.length - 1}
                        collapsedPaths={collapsedPaths}
                        onToggleCollapsed={onToggleCollapsed}
                        searchQuery={searchQuery}
                      />
                    ),
                  )}
              <div style={indentStyle} className="flex items-start gap-2">
                <span className="size-5" aria-hidden="true" />
                <span className="text-muted-foreground">
                  {close}
                  {!isLast ? (
                    <span className="text-muted-foreground">,</span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function JsonViewer({
  value,
  collapsedPaths,
  onToggleCollapsed,
  searchQuery,
  className,
}: JsonViewerProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex-1 min-h-0 overflow-auto rounded-lg border bg-background p-4 font-mono text-sm leading-6",
          className,
        )}
      >
        <JsonNode
          value={value}
          path="$"
          depth={0}
          collapsedPaths={collapsedPaths}
          onToggleCollapsed={onToggleCollapsed}
          searchQuery={searchQuery}
          isLast
        />
      </div>
    </div>
  );
}

export function getRootItemCount(value: JsonValue): number | null {
  if (Array.isArray(value)) return value.length;
  if (isObject(value)) return Object.keys(value).length;
  return null;
}

export function computeCollapsedPathsByLevel(
  value: JsonValue,
  level: number,
): Set<string> {
  const collapsed = new Set<string>();

  const visit = (node: JsonValue, depth: number, path: string) => {
    if (node === null || typeof node !== "object") return;
    if (depth >= level) {
      collapsed.add(path);
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((child, index) => visit(child, depth + 1, `${path}[${index}]`));
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      visit(child, depth + 1, `${path}.${key}`);
    }
  };

  visit(value, 0, "$");
  return collapsed;
}
