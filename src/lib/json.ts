export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export function parseJsonText(input: string): { value: JsonValue } | { error: string } {
  try {
    return { value: JSON.parse(input) as JsonValue };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return { error: message };
  }
}

export function stringifyPretty(value: JsonValue, indent = 2): string {
  return JSON.stringify(value, null, indent);
}

export function stringifyMinified(value: JsonValue): string {
  return JSON.stringify(value);
}

export function getRootItemCount(value: JsonValue): number | null {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, JsonValue>).length;
  }
  return null;
}

export function sortJsonKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, JsonValue>;
  const next: Record<string, JsonValue> = {};
  for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
    next[key] = sortJsonKeys(record[key]);
  }
  return next;
}

export function looseUnescapeText(input: string): string {
  if (!input.includes("\\")) {
    return input;
  }

  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }

    const next = input[i + 1];
    if (next == null) {
      out += "\\";
      continue;
    }

    i += 1;
    switch (next) {
      case '"':
        out += '"';
        break;
      case "\\":
        out += "\\";
        break;
      case "/":
        out += "/";
        break;
      case "b":
        out += "\b";
        break;
      case "f":
        out += "\f";
        break;
      case "n":
        out += "\n";
        break;
      case "r":
        out += "\r";
        break;
      case "t":
        out += "\t";
        break;
      case "u": {
        const hex = input.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          out += String.fromCharCode(Number.parseInt(hex, 16));
          i += 4;
        } else {
          out += "u";
        }
        break;
      }
      default:
        // "loose" behavior: drop the backslash for unknown escapes (e.g. \{ -> {)
        out += next;
    }
  }

  return out;
}

export function removeJsonEscapes(input: string): { text: string; changed: boolean } {
  const trimmed = input.trim();
  if (!trimmed.includes("\\")) {
    return { text: input, changed: false };
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") {
        return { text: parsed, changed: parsed !== input };
      }
    } catch {
      // fall through
    }
    const unquoted = trimmed.slice(1, -1);
    const text = looseUnescapeText(unquoted);
    return { text, changed: text !== input };
  }

  const text = looseUnescapeText(input);
  return { text, changed: text !== input };
}
