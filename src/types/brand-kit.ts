export type WindowChrome = "macos" | "windows" | "terminal" | "none";
export type WatermarkPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface BrandKit {
  background: string;
  windowChrome: WindowChrome;
  windowChromeColor: string;
  accentColor: string;
  syntaxTheme: "github-dark" | "dracula" | "nord";
  codeFont: string;
  codeFontSize: number;
  labelFont: string;
  padding: number;
  borderRadius: number;
  watermark?: {
    text: string;
    position: WatermarkPosition;
  };
}

export const defaultBrandKit: BrandKit = {
  background: "#0D1117",
  windowChrome: "macos",
  windowChromeColor: "#161B22",
  accentColor: "#58A6FF",
  syntaxTheme: "github-dark",
  codeFont: "JetBrains Mono, monospace",
  codeFontSize: 26,
  labelFont: "Inter, sans-serif",
  padding: 48,
  borderRadius: 12,
  watermark: {
    text: "@yourhandle",
    position: "bottom-right",
  },
};
