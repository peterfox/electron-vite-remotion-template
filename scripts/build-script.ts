/**
 * Converts a whisper transcript + source file into a CompositionScript JSON
 * ready for Remotion to render.
 *
 * This is the prototype of the "agent alignment" step: it matches spoken words
 * to code lines using keyword overlap. The voice pipeline will eventually replace
 * this heuristic with an LLM call, but the output shape stays the same.
 *
 * Usage:
 *   npm run script:build -- --transcript voiceover.transcript.json --code src/auth.ts
 *   npm run script:build -- --transcript voiceover.transcript.json --code src/auth.ts --out script.json
 *   npm run script:build -- --transcript voiceover.transcript.json --code src/auth.ts --fps 30 --brand brand.json
 *
 * Output:
 *   <name>.script.json  (or --out path)
 *   A CompositionScript that can be loaded as Remotion defaultProps.
 */
import type { TranscriptionJson } from "@remotion/install-whisper-cpp";
import fs from "fs";
import path from "path";
import type {
  Caption,
  CompositionScript,
  HighlightSequence,
} from "../src/types/composition-script";
import { defaultBrandKit } from "../src/types/brand-kit";
import type { BrandKit } from "../src/types/brand-kit";

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));
const transcriptPath = args["transcript"] ?? args["t"];
const codePath = args["code"] ?? args["c"];
const outPath = args["out"] ?? args["o"];
const fps = Number(args["fps"] ?? 30);
const brandPath = args["brand"];

if (!transcriptPath || !codePath) {
  console.error(
    "Usage: npm run script:build -- --transcript <file.transcript.json> --code <file.ts> [--out output.json] [--fps 30] [--brand brand.json]"
  );
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--?/, "");
    const value = argv[i + 1]?.startsWith("-") ? "true" : argv[i + 1] ?? "true";
    if (argv[i].startsWith("-")) { out[key] = value; if (!argv[i+1]?.startsWith("-")) i++; }
  }
  return out;
}

/** "HH:MM:SS,mmm" → milliseconds */
function tsToMs(ts: string): number {
  const [hms, ms] = ts.split(",");
  const [h, m, s] = hms.split(":").map(Number);
  return (h * 3600 + m * 60 + s) * 1000 + Number(ms);
}

function msToFrame(ms: number): number {
  return Math.round((ms / 1000) * fps);
}

/** Split camelCase/PascalCase identifiers into lowercase words */
function splitIdentifier(word: string): string[] {
  return word
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean);
}

/** Extract all identifiers from a line of code */
function extractIdentifiers(line: string): Set<string> {
  const words = new Set<string>();
  const matches = line.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) ?? [];
  for (const m of matches) {
    words.add(m.toLowerCase());
    for (const part of splitIdentifier(m)) words.add(part);
  }
  return words;
}

/** Strip punctuation and lowercase a transcript phrase */
function normaliseText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2); // skip stop words by length
}

// ─── Core alignment ───────────────────────────────────────────────────────────

function buildLineIdentifierMap(lines: string[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (let i = 0; i < lines.length; i++) {
    for (const id of extractIdentifiers(lines[i])) {
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(i);
    }
  }
  return map;
}

/**
 * Given a set of transcript words, find the code lines they best refer to.
 * Returns the [startLine, endLine] range of the best-matching block, or null
 * if no meaningful overlap is found.
 */
function alignSegmentToLines(
  transcriptWords: string[],
  lineIdMap: Map<string, number[]>,
  totalLines: number
): [number, number] | null {
  // Score each line by how many transcript words match its identifiers
  const lineScores = new Array<number>(totalLines).fill(0);

  for (const word of transcriptWords) {
    const lines = lineIdMap.get(word);
    if (lines) {
      for (const line of lines) lineScores[line] += 1;
    }
  }

  const maxScore = Math.max(...lineScores);
  if (maxScore === 0) return null;

  // Find contiguous run of lines around the peak score
  const peakLine = lineScores.indexOf(maxScore);
  let start = peakLine;
  let end = peakLine;

  // Expand to include adjacent lines with any score (part of the same block)
  while (start > 0 && lineScores[start - 1] > 0) start--;
  while (end < totalLines - 1 && lineScores[end + 1] > 0) end++;

  return [start, end];
}

// ─── Caption generation ───────────────────────────────────────────────────────

function buildCaptions(
  transcription: TranscriptionJson<true>["transcription"],
  combineWithinMs = 400
): Caption[] {
  const captions: Caption[] = [];
  let buffer: { text: string; startMs: number; endMs: number } | null = null;

  for (const segment of transcription) {
    for (const token of segment.tokens) {
      const text = token.text.replace(/^[^a-zA-Z0-9]+/, ""); // strip leading punctuation
      if (!text.trim()) continue;

      const startMs = token.offsets.from;
      const endMs = token.offsets.to;

      if (buffer && startMs - buffer.endMs <= combineWithinMs) {
        buffer.text += " " + text;
        buffer.endMs = endMs;
      } else {
        if (buffer) {
          captions.push({
            text: buffer.text.trim(),
            startFrame: msToFrame(buffer.startMs),
            endFrame: msToFrame(buffer.endMs),
          });
        }
        buffer = { text, startMs, endMs };
      }
    }
  }

  if (buffer) {
    captions.push({
      text: buffer.text.trim(),
      startFrame: msToFrame(buffer.startMs),
      endFrame: msToFrame(buffer.endMs),
    });
  }

  return captions;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  const transcript: TranscriptionJson<true> = JSON.parse(
    fs.readFileSync(path.resolve(transcriptPath), "utf-8")
  );
  const code = fs.readFileSync(path.resolve(codePath), "utf-8");
  const language = path.extname(codePath).replace(".", "") || "typescript";
  const lines = code.split("\n");

  const brandKit: BrandKit = brandPath
    ? JSON.parse(fs.readFileSync(path.resolve(brandPath), "utf-8"))
    : defaultBrandKit;

  const lineIdMap = buildLineIdentifierMap(lines);

  // Build highlight sequences — one per transcript segment
  const sequences: HighlightSequence[] = [];

  for (const segment of transcript.transcription) {
    const words = normaliseText(segment.text);
    const match = alignSegmentToLines(words, lineIdMap, lines.length);
    if (!match) continue;

    const startFrame = msToFrame(segment.offsets.from);
    const endFrame = msToFrame(segment.offsets.to);
    const durationInFrames = Math.max(endFrame - startFrame, fps); // min 1s

    // Avoid duplicate ranges
    const last = sequences[sequences.length - 1];
    if (last?.lines[0] === match[0] && last?.lines[1] === match[1]) continue;

    sequences.push({
      type: "highlight",
      from: startFrame,
      durationInFrames,
      lines: match,
      label: words.slice(0, 3).join(" "), // first 3 words as a provisional label
    });
  }

  const captions = buildCaptions(transcript.transcription);

  const script: CompositionScript = {
    code,
    language,
    brandKit,
    fps,
    sequences,
    captions,
  };

  const defaultOut = path.resolve(codePath).replace(/\.[^.]+$/, ".script.json");
  const dest = outPath ? path.resolve(outPath) : defaultOut;
  fs.writeFileSync(dest, JSON.stringify(script, null, 2));

  console.log(`Script written to: ${dest}`);
  console.log(`  ${sequences.length} highlight sequences`);
  console.log(`  ${captions.length} captions`);
  console.log(`\nLoad it in root.tsx:`);
  console.log(`  import script from '${path.relative(path.join(process.cwd(), "src"), dest)}';`);
}

run();
