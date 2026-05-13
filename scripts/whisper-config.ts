import path from "path";

// Shared constants used by both whisper-setup.ts and transcribe.ts.
// Change WHISPER_VERSION if you need a different whisper.cpp build.

export const WHISPER_VERSION = "1.5.4";
export const WHISPER_MODEL = "base.en" as const; // fast, English-only, good for prototyping
export const WHISPER_DIR = path.join(process.cwd(), ".whisper");
export const MODEL_DIR = path.join(WHISPER_DIR, "models");
