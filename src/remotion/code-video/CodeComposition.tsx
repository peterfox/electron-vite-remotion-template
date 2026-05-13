import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { CodeCompositionProps } from "../../types/composition-script";
import { CaptionOverlay } from "./CaptionOverlay";
import { CodeFrame } from "./CodeFrame";
import { LineHighlight } from "./LineHighlight";

export const CodeComposition: React.FC<CodeCompositionProps> = (props) => {
  const { tokenizedLines, brandKit, sequences, captions, language } = props;

  return (
    <AbsoluteFill style={{ backgroundColor: brandKit.background }}>
      {/* Static code frame — always visible, brand-styled */}
      <CodeFrame
        tokenizedLines={tokenizedLines}
        brandKit={brandKit}
        language={language}
      />

      {/* Timed sequences — each drives one animation event */}
      {sequences.map((seq, i) => {
        if (seq.type === "highlight") {
          return (
            <Sequence key={i} from={seq.from} durationInFrames={seq.durationInFrames}>
              <LineHighlight
                lines={seq.lines}
                color={seq.color ?? brandKit.accentColor}
                label={seq.label}
                brandKit={brandKit}
              />
            </Sequence>
          );
        }

        // "reveal" and "callout" are stubs for future implementation.
        // The type system already defines them — only the renderer is deferred.
        return null;
      })}

      {/* Caption track — populated by the STT pipeline */}
      {captions.length > 0 && (
        <CaptionOverlay captions={captions} brandKit={brandKit} />
      )}

      {/* Brand watermark */}
      {brandKit.watermark && (
        <WatermarkOverlay text={brandKit.watermark.text} position={brandKit.watermark.position} brandKit={brandKit} />
      )}
    </AbsoluteFill>
  );
};

// ─── Watermark ────────────────────────────────────────────────────────────────

interface WatermarkProps {
  text: string;
  position: string;
  brandKit: CodeCompositionProps["brandKit"];
}

const EDGE = 32;

const positionStyle = (position: string): React.CSSProperties => {
  switch (position) {
    case "bottom-right": return { bottom: EDGE, right: EDGE };
    case "bottom-left":  return { bottom: EDGE, left: EDGE };
    case "top-right":    return { top: EDGE, right: EDGE };
    case "top-left":     return { top: EDGE, left: EDGE };
    default:             return { bottom: EDGE, right: EDGE };
  }
};

const WatermarkOverlay: React.FC<WatermarkProps> = ({ text, position, brandKit }) => (
  <div
    style={{
      position: "absolute",
      ...positionStyle(position),
      color: "rgba(255,255,255,0.25)",
      fontFamily: brandKit.labelFont,
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: "0.04em",
      userSelect: "none",
    }}
  >
    {text}
  </div>
);
