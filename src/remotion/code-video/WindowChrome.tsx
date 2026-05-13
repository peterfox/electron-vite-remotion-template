import React from "react";
import type { BrandKit } from "../../types/brand-kit";
import { CHROME_HEIGHT, FRAME_WIDTH } from "./layout";

interface Props {
  brandKit: BrandKit;
  filename?: string;
}

const DOT_SIZE = 12;
const DOT_GAP = 8;
const DOT_OFFSET_LEFT = 16;

const DOT_COLORS = {
  macos: ["#FF5F57", "#FFBD2E", "#28CA42"],
  windows: ["#E81123", "#E8C900", "#3CCE3C"],
  terminal: ["#FF5F57", "#FFBD2E", "#28CA42"],
  none: [],
};

export const WindowChrome: React.FC<Props> = ({ brandKit, filename }) => {
  if (brandKit.windowChrome === "none") return null;

  const dots = DOT_COLORS[brandKit.windowChrome] ?? [];
  const isTerminal = brandKit.windowChrome === "terminal";

  return (
    <div
      style={{
        width: FRAME_WIDTH,
        height: CHROME_HEIGHT,
        backgroundColor: brandKit.windowChromeColor,
        borderRadius: `${brandKit.borderRadius}px ${brandKit.borderRadius}px 0 0`,
        display: "flex",
        alignItems: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Traffic-light dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: DOT_GAP,
          paddingLeft: DOT_OFFSET_LEFT,
        }}
      >
        {dots.map((color, i) => (
          <div
            key={i}
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      {/* Filename / tab label */}
      {filename && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#8B949E",
            fontSize: 14,
            fontFamily: brandKit.labelFont,
            letterSpacing: "0.02em",
          }}
        >
          {isTerminal ? `~ ${filename}` : filename}
        </div>
      )}
    </div>
  );
};
