import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("node_modules/monaco-editor/min/vs");
const dest = path.resolve("public/monaco/vs");

async function main() {
  await rm(dest, { recursive: true, force: true });
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(source, dest, { recursive: true });
}

main().catch((err) => {
  console.error("[copy-monaco] failed:", err);
  process.exitCode = 1;
});
