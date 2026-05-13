/**
 * One-time setup: installs whisper.cpp and downloads the base.en model.
 * Run once before using transcribe.ts.
 *
 * Usage:
 *   npm run whisper:setup
 */
import { downloadWhisperModel, installWhisperCpp } from "@remotion/install-whisper-cpp";
import { MODEL_DIR, WHISPER_DIR, WHISPER_MODEL, WHISPER_VERSION } from "./whisper-config";

async function setup() {
  console.log(`Installing whisper.cpp v${WHISPER_VERSION} → ${WHISPER_DIR}`);
  const install = await installWhisperCpp({
    version: WHISPER_VERSION,
    to: WHISPER_DIR,
    printOutput: true,
  });
  console.log(install.alreadyExisted ? "  already installed, skipped." : "  done.");

  console.log(`\nDownloading model "${WHISPER_MODEL}" → ${MODEL_DIR}`);
  const download = await downloadWhisperModel({
    model: WHISPER_MODEL,
    folder: MODEL_DIR,
    printOutput: true,
    onProgress: (p) => process.stdout.write(`\r  ${(p * 100).toFixed(1)}%`),
  });
  console.log(download.alreadyExisted ? "\n  already downloaded, skipped." : "\n  done.");

  console.log("\nSetup complete. Run `npm run whisper:transcribe -- <audio.wav>` next.");
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});
