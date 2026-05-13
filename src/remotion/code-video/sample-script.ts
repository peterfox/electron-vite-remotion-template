import { defaultBrandKit } from "../../types/brand-kit";
import type { CompositionScript } from "../../types/composition-script";

// ─── Demo code ────────────────────────────────────────────────────────────────
// This is the raw code a developer or agent would provide.
// Line indices (0-based) used in sequences below:
//   0:  function verifyToken(token: string): User | null {
//   1:    if (!token) {
//   2:      return null;
//   3:    }
//   4:  (empty)
//   5:    try {
//   6:      const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   7:      return decoded as User;
//   8:    } catch (error) {
//   9:      console.error('Token verification failed:', error);
//  10:      return null;
//  11:    }
//  12: }

const code = `function verifyToken(token: string): User | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded as User;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}`;

// ─── Sample CompositionScript ─────────────────────────────────────────────────
// This is the boundary type. In production this object is produced by:
//   - the voice pipeline: STT timestamps → agent → script
//   - the CLI: code-vid render --file auth.ts
//   - the GUI: user edits in the editor screen
//
// Remotion receives this and renders it. It knows nothing about where it came from.

export const sampleScript: CompositionScript = {
  code,
  language: "typescript",
  brandKit: defaultBrandKit,
  fps: 30,

  sequences: [
    // Full signature — orient the viewer
    {
      type: "highlight",
      from: 20,
      durationInFrames: 80,
      lines: [0, 0],
      label: "function signature",
    },
    // Guard clause — early return pattern
    {
      type: "highlight",
      from: 110,
      durationInFrames: 80,
      lines: [1, 3],
      label: "early return guard",
    },
    // The actual JWT call
    {
      type: "highlight",
      from: 200,
      durationInFrames: 80,
      lines: [5, 7],
      label: "JWT verification",
    },
    // Error handling
    {
      type: "highlight",
      from: 290,
      durationInFrames: 80,
      lines: [8, 11],
      label: "error handling",
    },
  ],

  // Captions mirror what a developer would say in a voiceover.
  // startFrame / endFrame will eventually come from Whisper word timestamps.
  captions: [
    { text: "Let's look at our token verification function", startFrame: 0, endFrame: 18 },
    { text: "First, the function signature — it accepts a string and returns a User or null", startFrame: 20, endFrame: 98 },
    { text: "We guard early: if there's no token we bail out immediately", startFrame: 110, endFrame: 188 },
    { text: "jwt.verify does the heavy lifting — throws on invalid or expired tokens", startFrame: 200, endFrame: 278 },
    { text: "The catch block handles those failures gracefully", startFrame: 290, endFrame: 368 },
  ],
};
