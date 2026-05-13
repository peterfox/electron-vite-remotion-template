import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { BrandKit } from "../../types/brand-kit";
import type { Caption } from "../../types/composition-script";

interface Props {
  captions: Caption[];
  brandKit: BrandKit;
}

const CAPTION_BOTTOM = 60;
const FADE_FRAMES = 6;

export const CaptionOverlay: React.FC<Props> = ({ captions, brandKit }) => {
  const frame = useCurrentFrame();

  const active = captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );

  if (!active) return null;

  const relativeFrame = frame - active.startFrame;
  const durationInFrames = active.endFrame - active.startFrame;

  const opacity = interpolate(
    relativeFrame,
    [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const y = interpolate(relativeFrame, [0, FADE_FRAMES], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: CAPTION_BOTTOM,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            color: "#FFFFFF",
            fontFamily: brandKit.labelFont,
            fontSize: 28,
            fontWeight: 500,
            padding: "12px 32px",
            borderRadius: 8,
            letterSpacing: "0.01em",
            maxWidth: 1200,
            textAlign: "center",
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
