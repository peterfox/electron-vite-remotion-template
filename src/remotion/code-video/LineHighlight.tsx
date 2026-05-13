import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandKit } from "../../types/brand-kit";
import { FRAME_LEFT, FRAME_WIDTH, lineHeight, lineTop } from "./layout";

interface Props {
  lines: [number, number]; // [startLine, endLine] inclusive, 0-indexed
  color: string;
  label?: string;
  brandKit: BrandKit;
}

const BORDER_WIDTH = 4;
const FADE_OUT_FRAMES = 8; // frames before sequence end to begin fade

export const LineHighlight: React.FC<Props> = ({ lines, color, label, brandKit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const lh = lineHeight(brandKit.codeFontSize);

  // Fade in with spring
  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 60, mass: 0.8 },
  });

  // Fade out near end of sequence
  const fadeOut = interpolate(
    frame,
    [durationInFrames - FADE_OUT_FRAMES, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = fadeIn * fadeOut;

  // Label slides in from the right
  const labelX = interpolate(fadeIn, [0, 1], [24, 0]);

  const [startLine, endLine] = lines;
  const top = lineTop(startLine, brandKit.codeFontSize);
  const height = (endLine - startLine + 1) * lh;

  // Hex color with alpha for the background fill
  const fillColor = `${color}1A`; // ~10% opacity

  return (
    <AbsoluteFill>
      {/* Highlight band */}
      <div
        style={{
          position: "absolute",
          top,
          left: FRAME_LEFT,
          width: FRAME_WIDTH,
          height,
          backgroundColor: fillColor,
          borderLeft: `${BORDER_WIDTH}px solid ${color}`,
          opacity,
        }}
      />

      {/* Label */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: top + lh / 2 - 12,
            left: FRAME_LEFT + FRAME_WIDTH + 16,
            color,
            fontSize: 20,
            fontFamily: brandKit.labelFont,
            fontWeight: 500,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            opacity,
            transform: `translateX(${labelX}px)`,
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
