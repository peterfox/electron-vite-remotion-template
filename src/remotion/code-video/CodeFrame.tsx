import React from "react";
import type { BrandKit } from "../../types/brand-kit";
import type { TokenizedLine } from "../../types/composition-script";
import {
  CHROME_HEIGHT,
  CODE_PADDING_LEFT,
  CODE_PADDING_TOP,
  FRAME_HEIGHT,
  FRAME_LEFT,
  FRAME_TOP,
  FRAME_WIDTH,
  LINE_NUMBER_WIDTH,
  lineHeight,
} from "./layout";
import { WindowChrome } from "./WindowChrome";

interface Props {
  tokenizedLines: TokenizedLine[];
  brandKit: BrandKit;
  language?: string;
  filename?: string;
}

export const CodeFrame: React.FC<Props> = ({
  tokenizedLines,
  brandKit,
  filename,
}) => {
  const lh = lineHeight(brandKit.codeFontSize);

  return (
    <div
      style={{
        position: "absolute",
        left: FRAME_LEFT,
        top: FRAME_TOP,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        backgroundColor: brandKit.background,
        borderRadius: brandKit.borderRadius,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        // Subtle border to lift the frame off the background
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.6)",
      }}
    >
      <WindowChrome brandKit={brandKit} filename={filename} />

      {/* Code area */}
      <div
        style={{
          flex: 1,
          paddingTop: CODE_PADDING_TOP,
          paddingLeft: CODE_PADDING_LEFT,
          paddingRight: CODE_PADDING_LEFT,
          overflow: "hidden",
          fontFamily: brandKit.codeFont,
          fontSize: brandKit.codeFontSize,
          lineHeight: `${lh}px`,
        }}
      >
        {tokenizedLines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            style={{
              display: "flex",
              height: lh,
              alignItems: "center",
            }}
          >
            {/* Line number */}
            <span
              style={{
                width: LINE_NUMBER_WIDTH,
                color: "#3D444D",
                userSelect: "none",
                flexShrink: 0,
                textAlign: "right",
                paddingRight: 20,
                fontSize: brandKit.codeFontSize * 0.8,
              }}
            >
              {lineIndex + 1}
            </span>

            {/* Tokens */}
            <span>
              {line.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  style={{
                    color: token.color,
                    fontWeight: token.bold ? 700 : 400,
                    fontStyle: token.italic ? "italic" : "normal",
                    whiteSpace: "pre",
                  }}
                >
                  {token.content}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
