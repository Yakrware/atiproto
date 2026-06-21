#!/usr/bin/env node
// Combine src/schemas (com.atiproto.*) and src/associated-schemas
// (network.attested.* drafts) into a single temp directory and run
// `lex build` so cross-namespace refs resolve. Output lands in
// src/lexicons. The temp dir is removed after.

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const tmp = join(root, ".lex-build");
const schemasDir = join(root, "src", "schemas");
const associatedDir = join(root, "src", "associated-schemas");
const outDir = join(root, "src", "lexicons");

if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

cpSync(schemasDir, tmp, { recursive: true });
cpSync(associatedDir, tmp, { recursive: true });

try {
  execSync(
    `npx lex build --lexicons ${tmp} --out ${outDir} --clear --indexFile`,
    { stdio: "inherit", cwd: root },
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
