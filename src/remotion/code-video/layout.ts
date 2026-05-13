// Layout constants for a 1920×1080 composition.
// All values are in pixels. Components use these so that LineHighlight can
// position itself precisely over CodeFrame lines without prop-drilling coords.

export const COMP_WIDTH = 1920;
export const COMP_HEIGHT = 1080;

// The code window frame, centered on the composition
export const FRAME_WIDTH = 1440;
export const FRAME_HEIGHT = 800;
export const FRAME_LEFT = (COMP_WIDTH - FRAME_WIDTH) / 2;   // 240
export const FRAME_TOP = (COMP_HEIGHT - FRAME_HEIGHT) / 2;  // 140

// Window chrome bar at the top of the frame
export const CHROME_HEIGHT = 44;

// Padding inside the code area (below the chrome)
export const CODE_PADDING_TOP = 24;
export const CODE_PADDING_LEFT = 48;

// Line number column width
export const LINE_NUMBER_WIDTH = 52;

// Derived: where the first line of code starts on the composition
export const CODE_AREA_TOP = FRAME_TOP + CHROME_HEIGHT + CODE_PADDING_TOP;
export const CODE_AREA_LEFT = FRAME_LEFT + CODE_PADDING_LEFT;

// Typography — must match what CodeFrame renders
export const CODE_FONT_SIZE = 26; // px, default; overridden by brandKit.codeFontSize
export const LINE_HEIGHT_RATIO = 1.65;

export function lineHeight(fontSize: number = CODE_FONT_SIZE): number {
  return Math.round(fontSize * LINE_HEIGHT_RATIO);
}

// Top pixel position of line N (0-indexed) within the composition
export function lineTop(lineIndex: number, fontSize: number = CODE_FONT_SIZE): number {
  return CODE_AREA_TOP + lineIndex * lineHeight(fontSize);
}
