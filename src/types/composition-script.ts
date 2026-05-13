import type { BrandKit } from "./brand-kit";

// ─── Token layer ──────────────────────────────────────────────────────────────
// Pre-tokenized by whatever pipeline produces the script (agent, CLI, GUI).
// Remotion never runs a tokenizer — it only renders these.

export interface TokenizedToken {
  content: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
}

export type TokenizedLine = TokenizedToken[];

// ─── Sequence types ───────────────────────────────────────────────────────────
// An ordered list of timed events that drive the animation.
// Frame numbers are absolute (relative to the composition start).

interface BaseSequence {
  from: number;
  durationInFrames: number;
}

export interface RevealSequence extends BaseSequence {
  type: "reveal";
  lines: [number, number]; // [startLine, endLine] inclusive, 0-indexed
}

export interface HighlightSequence extends BaseSequence {
  type: "highlight";
  lines: [number, number];
  label?: string;
  color?: string; // defaults to brandKit.accentColor
}

export interface CalloutSequence extends BaseSequence {
  type: "callout";
  line: number;
  text: string;
}

export type VideoSequence = RevealSequence | HighlightSequence | CalloutSequence;

// ─── Caption ──────────────────────────────────────────────────────────────────
// Driven by STT word timestamps: startFrame = Math.round(startSeconds * fps)

export interface Caption {
  text: string;
  startFrame: number;
  endFrame: number;
}

// ─── CompositionScript ────────────────────────────────────────────────────────
// The boundary type. Everything above this line is produced by:
//   - the voice pipeline (STT → agent → script)
//   - the CLI
//   - the GUI
// Everything below this line is Remotion's concern.

export interface CompositionScript {
  code: string;
  language: string;
  brandKit: BrandKit;
  fps: number;
  sequences: VideoSequence[];
  captions: Caption[];
}

// ─── Remotion props ───────────────────────────────────────────────────────────
// calculateMetadata enriches CompositionScript with tokenized lines and
// resolves durationInFrames before the composition renders.

export interface CodeCompositionProps extends CompositionScript {
  tokenizedLines: TokenizedLine[];
  durationInFrames: number;
}
