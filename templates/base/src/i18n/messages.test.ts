import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { messages } from "./messages";

const messagesDirectory = path.join(process.cwd(), "messages", "en");

function toCamelCase(value: string) {
  return value.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

describe("message registry", () => {
  it("registers every English message file as a namespace", () => {
    const fileNamespaces = readdirSync(messagesDirectory)
      .filter((file) => file.endsWith(".json"))
      .map((file) => toCamelCase(file.replace(/\.json$/, "")))
      .sort();

    expect(Object.keys(messages).sort()).toEqual(fileNamespaces);
  });
});
