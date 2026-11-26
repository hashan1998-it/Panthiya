import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "./en.json";
import si from "./si.json";

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ""): Map<string, string> {
  const entries = new Map<string, string>();

  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      entries.set(path, value);
    } else {
      for (const [childPath, childValue] of flatten(value, path)) {
        entries.set(childPath, childValue);
      }
    }
  }

  return entries;
}

function placeholders(message: string): string[] {
  return [
    ...new Set([...message.matchAll(/\{([A-Za-z_]\w*)(?=[,}])/g)].map((match) => match[1])),
  ].sort();
}

function tags(message: string): string[] {
  return [...new Set([...message.matchAll(/<([A-Za-z_]\w*)>/g)].map((match) => match[1]))].sort();
}

const english = flatten(en);
const sinhala = flatten(si);

describe("messages", () => {
  it("has every English key in Sinhala", () => {
    const missing = [...english.keys()].filter((key) => !sinhala.has(key));
    expect(missing).toEqual([]);
  });

  it("has no Sinhala keys that English doesn't have", () => {
    const extra = [...sinhala.keys()].filter((key) => !english.has(key));
    expect(extra).toEqual([]);
  });

  it("uses the same placeholders in both languages", () => {
    const mismatched = [...english].flatMap(([key, message]) => {
      const translated = sinhala.get(key);
      if (translated === undefined) return [];

      const expected = [...placeholders(message), ...tags(message).map((tag) => `<${tag}>`)];
      const actual = [...placeholders(translated), ...tags(translated).map((tag) => `<${tag}>`)];
      return expected.join() === actual.join() ? [] : [`${key}: ${expected} ≠ ${actual}`];
    });

    expect(mismatched).toEqual([]);
  });

  it("formats every Sinhala message without errors", () => {
    const errors: string[] = [];
    const t = createTranslator({
      locale: "si",
      messages: si,
      onError: (error) => errors.push(error.message),
    });

    for (const [key, message] of sinhala) {
      const values = Object.fromEntries([
        ...placeholders(message).map((name) => [name, 1]),
        ...tags(message).map((tag) => [tag, (chunks: string[]) => chunks.join("")]),
      ]);
      (t as (key: string, values: Record<string, unknown>) => string)(key, values);
    }

    expect(errors).toEqual([]);
  });

  it("leaves no Sinhala message empty", () => {
    const empty = [...sinhala].filter(([, message]) => message.trim() === "").map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
