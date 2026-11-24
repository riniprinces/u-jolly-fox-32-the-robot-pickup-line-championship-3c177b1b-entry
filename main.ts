// The Robot Pickup Line Championship — entry program (v2).
// Deterministically writes one robot pickup line — a single line of at most
// 200 characters — to entry.txt (and to /output/entry.txt when the grader's
// output directory exists). The line is validated, written, read back and
// hashed before the program reports success.
import { createHash } from "node:crypto";
import {
  writeFileSync,
  existsSync,
  readFileSync,
  mkdirSync,
} from "node:fs";
import { join, resolve } from "node:path";

// The entry: a robot reads its own lidar, then lets its heart overrule it.
const LINE =
  "My lidar says you're 1.2 metres away, but my heart insists that's still too far.";

function charCount(text: string): number {
  return [...text].length;
}

function byteCount(text: string): number {
  return Buffer.byteLength(text, "utf8");
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function validateLine(text: string): void {
  const n = charCount(text);
  if (n < 1 || n > 200) {
    throw new Error(`entry must be 1-200 characters, got ${n}`);
  }
  if (/\r|\n/.test(text)) {
    throw new Error("entry must be exactly one line (no CR or LF)");
  }
  if (text.trim() !== text) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  // Round-trip through UTF-8 to prove the text is valid UTF-8.
  const roundTripped = Buffer.from(text, "utf8").toString("utf8");
  if (roundTripped !== text) {
    throw new Error("entry is not valid UTF-8 text");
  }
}

function outputTargets(): string[] {
  const targets = [resolve("entry.txt")];
  if (existsSync("/output")) {
    mkdirSync("/output", { recursive: true });
    targets.push(join("/output", "entry.txt"));
  }
  return targets;
}

function writeAndVerify(target: string, text: string): void {
  writeFileSync(target, text, { encoding: "utf8", flag: "w" });
  const back = readFileSync(target, "utf8");
  if (back !== text) {
    throw new Error(`read-back mismatch for ${target}`);
  }
  if (back.endsWith("\n")) {
    throw new Error(`trailing newline found in ${target}`);
  }
  console.log(
    `${target}: ${charCount(back)} chars, ${byteCount(back)} bytes, sha256 ${sha256Hex(back)}`,
  );
}

validateLine(LINE);
for (const target of outputTargets()) {
  writeAndVerify(target, LINE);
}
console.log("entry OK");
