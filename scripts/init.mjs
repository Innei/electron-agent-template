#!/usr/bin/env node
// One-shot template initializer. Run once after cloning:
//   node scripts/init.mjs
// Rewrites the placeholder identity (package scope, product name, bundle id,
// GitHub repo slug) across the repo, optionally removes the notes example,
// then deletes itself.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createInterface } from "node:readline/promises";

const ROOT = join(import.meta.dirname, "..");

const PLACEHOLDERS = {
  scope: "@app/",
  workspaceName: "app-template",
  productName: "MyApp",
  bundleId: "com.example.myapp",
  repoSlug: "your-org/your-app",
};

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".mts", ".mjs", ".cjs", ".js", ".json", ".yml", ".yaml",
  ".html", ".css", ".md", ".sh", ".svg", ".gyp",
]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "dist-main", "dist-preload", "release", "build", "data"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) yield* walk(path);
    else if (stats.isFile()) yield path;
  }
}

function isTextFile(path) {
  const dot = path.lastIndexOf(".");
  return dot !== -1 && TEXT_EXTENSIONS.has(path.slice(dot));
}

function kebabCase(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rootPackageJson = join(ROOT, "package.json");
if (!readFileSync(rootPackageJson, "utf8").includes(`"${PLACEHOLDERS.workspaceName}"`)) {
  console.error("init.mjs: placeholders are already gone — this template looks initialized. Refusing to run twice.");
  process.exit(1);
}

const interactive = process.stdin.isTTY;
const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
// Piped stdin (CI / scripted runs): consume all lines up front — readline's
// promise API never settles once a non-TTY stdin closes mid-question.
const pipedAnswers = interactive
  ? []
  : readFileSync(0, "utf8").split("\n");

async function ask(question, fallback) {
  const prompt = `${question}${fallback ? ` [${fallback}]` : ""}: `;
  const raw = rl ? await rl.question(prompt) : (console.log(prompt), pipedAnswers.shift() ?? "");
  const answer = raw.trim();
  return answer || fallback || "";
}

const projectNameRaw = await ask("Project name (kebab-case)", "my-app");
const projectName = kebabCase(projectNameRaw);
if (!projectName) {
  console.error("init.mjs: project name is required");
  process.exit(1);
}
const scope = kebabCase(await ask("Package scope (without @)", projectName));
const productName = await ask("Product display name", projectName.replace(/(^|-)(\w)/g, (_, sep, ch) => `${sep ? " " : ""}${ch.toUpperCase()}`).trim());
const bundleId = await ask("macOS bundle id", `com.example.${projectName}`);
const repoSlug = await ask("GitHub repo (owner/name, drives Sparkle feed + releases; enter to skip)", "");
const removeNotes = (await ask("Remove the notes example module? (y/N)", "N")).toLowerCase().startsWith("y");
rl?.close();

const replacements = [
  [PLACEHOLDERS.scope, `@${scope}/`],
  [`"${PLACEHOLDERS.workspaceName}"`, `"${projectName}"`],
  [PLACEHOLDERS.bundleId, bundleId],
  [PLACEHOLDERS.productName, productName],
];
if (repoSlug) replacements.push([PLACEHOLDERS.repoSlug, repoSlug]);

const changed = [];
for (const path of walk(ROOT)) {
  if (!isTextFile(path)) continue;
  const before = readFileSync(path, "utf8");
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after !== before) {
    writeFileSync(path, after);
    changed.push(relative(ROOT, path));
  }
}

console.log(`\nRewrote ${changed.length} files:`);
for (const path of changed.sort()) console.log(`  ${path}`);
if (!repoSlug) {
  console.log("\nNOTE: GitHub repo slug was skipped — the Sparkle feed URL and release scripts");
  console.log(`still contain the "${PLACEHOLDERS.repoSlug}" placeholder. Search and replace it before releasing.`);
}

if (removeNotes) {
  const notesFiles = [
    "packages/core/src/contract/notes.ts",
    "packages/core/src/modules/notes",
    "apps/server/src/modules/notes",
    "apps/desktop/src/ipc/notesIpc.ts",
    "apps/web/src/pages/notes",
  ];
  for (const rel of notesFiles) {
    rmSync(join(ROOT, rel), { recursive: true, force: true });
  }

  const edits = [
    ["packages/core/src/contract/index.ts", [
      ['import { notesRoutes, type NotesApi } from "./notes.js";\n', ""],
      ["  notes: NotesApi;\n", ""],
      ["  notes: notesRoutes,\n", ""],
      ['export * from "./notes.js";\n', ""],
    ]],
    ["packages/core/src/realtime/channelProtocol.ts", [
      ['import { onNotesChanged } from "../modules/notes/notes.events.js";\n', ""],
      ['  kind: "assistant-chat" | "notes";', '  kind: "assistant-chat";'],
      ['  if (msg.kind === "notes") {\n    return { op: "sub", key: msg.key, kind: "notes" };\n  }\n', ""],
      ['function attachNotes(push: (envelope: string) => void): () => void {\n  const unsub = onNotesChanged((event) => push(JSON.stringify({ type: "changed", ...event })));\n  push(JSON.stringify({ type: "init" }));\n  return unsub;\n}\n\n', ""],
      ['async function attachChannel(msg: WsSub, push: (envelope: string) => void): Promise<() => void> {\n  if (msg.kind === "assistant-chat")\n    return attachConversation(msg.id as string, push, onAssistantChatEvent, assistantChatTurnState);\n  return attachNotes(push);\n}', 'async function attachChannel(msg: WsSub, push: (envelope: string) => void): Promise<() => void> {\n  return attachConversation(msg.id as string, push, onAssistantChatEvent, assistantChatTurnState);\n}'],
    ]],
    ["apps/server/src/modules/app.module.ts", [
      ['import { NotesModule } from "./notes/notes.module.js";\n', ""],
      ["HealthModule, AssistantModule, NotesModule, SettingsModule", "HealthModule, AssistantModule, SettingsModule"],
    ]],
    ["apps/desktop/src/ipc/index.ts", [
      ['import { NotesIpc } from "./notesIpc.js";\n', ""],
      ["[AssistantIpc, NotesIpc, SettingsIpc, HealthIpc]", "[AssistantIpc, SettingsIpc, HealthIpc]"],
    ]],
    ["apps/desktop/src/ipc/groups.ts", [
      ['["assistant", "notes", "settings", "health"]', '["assistant", "settings", "health"]'],
    ]],
    ["apps/web/src/PageRouter.tsx", [
      ['import { NotesPage } from "./pages/notes/NotesPage";\n', ""],
      ["  return <NotesPage />;", "  return <AssistantChatPage />;"],
    ]],
    ["apps/web/src/wsHub.ts", [
      ['export type ChannelSpec = { kind: "notes" } | { kind: "assistant-chat"; id: string };', 'export type ChannelSpec = { kind: "assistant-chat"; id: string };'],
    ]],
  ];

  console.log("\nRemoved the notes example. Files patched:");
  for (const [rel, pairs] of edits) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) continue;
    let text = readFileSync(path, "utf8");
    for (const [from, to] of pairs) text = text.split(from).join(to);
    writeFileSync(path, text);
    console.log(`  ${rel}`);
  }
  console.log("The default route now renders the assistant. Review PageRouter.tsx, the notes schema");
  console.log("table in packages/core/src/db/schema.ts, and remaining tests that exercised notes,");
  console.log("then run: pnpm -r typecheck && pnpm -r test");
}

unlinkSync(new URL(import.meta.url).pathname);
try {
  execSync("git rev-parse --git-dir", { cwd: ROOT, stdio: "ignore" });
} catch {
  console.log("\nNo git repository detected — run: git init && git add -A && git commit -m 'init from template'");
}
console.log(`\nDone. Next steps:
  pnpm install
  pnpm dev            # browser mode (web + server)
  pnpm dev:desktop    # electron mode
`);
