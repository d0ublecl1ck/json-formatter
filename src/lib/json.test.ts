import { describe, expect, it } from "vitest";

import {
  looseUnescapeText,
  parseJsonText,
  removeJsonEscapes,
  getRootItemCount,
  sortJsonKeys,
} from "@/lib/json";

describe("parseJsonText", () => {
  it("parses valid JSON", () => {
    const result = parseJsonText('{"a":1,"b":[true,null,"x"]}');
    expect("value" in result).toBe(true);
    if ("value" in result) {
      expect(result.value).toEqual({ a: 1, b: [true, null, "x"] });
    }
  });

  it("returns error for invalid JSON", () => {
    const result = parseJsonText("{");
    expect("error" in result).toBe(true);
  });
});

describe("sortJsonKeys", () => {
  it("sorts keys recursively", () => {
    const value = {
      b: 1,
      a: { d: 2, c: 3 },
      z: [{ b: 1, a: 2 }],
    };
    expect(sortJsonKeys(value)).toEqual({
      a: { c: 3, d: 2 },
      b: 1,
      z: [{ a: 2, b: 1 }],
    });
  });
});

describe("removeJsonEscapes", () => {
  it("removes escapes from JSON string literal", () => {
    const input = "\"{\\\"a\\\":1}\"";
    const { text, changed } = removeJsonEscapes(input);
    expect(changed).toBe(true);
    expect(text).toBe('{"a":1}');
  });

  it("loosely removes backslash-escaped quotes", () => {
    const input = "{\\\"a\\\":\\\"b\\\"}";
    const { text, changed } = removeJsonEscapes(input);
    expect(changed).toBe(true);
    expect(text).toBe('{"a":"b"}');
  });
});

describe("looseUnescapeText", () => {
  it("supports unicode escapes", () => {
    expect(looseUnescapeText("\\u4e2d\\u6587")).toBe("中文");
  });
});

describe("getRootItemCount", () => {
  it("returns null for primitives", () => {
    expect(getRootItemCount(true)).toBeNull();
    expect(getRootItemCount(null)).toBeNull();
    expect(getRootItemCount("x")).toBeNull();
  });

  it("returns length for arrays and key count for objects", () => {
    expect(getRootItemCount([1, 2, 3])).toBe(3);
    expect(getRootItemCount({ a: 1, b: 2 })).toBe(2);
  });
});
