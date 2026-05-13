/**
 * Transcribes an audio file using whisper.cpp and writes a JSON transcript
 * with word-level timestamps alongside the input file.
 *
 * Usage:
 *   npm run whisper:transcribe -- path/to/voiceover.wav
 *
 * Output:
 *   path/to/voiceover.transcript.json
 *
 * Notes:
 *   - Input must be a WAV file. Convert with:
 *       ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav
 *   - Run `npm run whisper:setup` first if whisper.cpp isn't installed.
 */
import { transcribe } from "@remotion/install-whisper-cpp";
import fs from "fs";
import path from "path";
import { MODEL_DIR, WHISPER_DIR, WHISPER_MODEL, WHISPER_VERSION } from "./whisper-config";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: npm run whisper:transcribe -- <path/to/audio.wav>");
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

async function run() {
  const resolvedInput = path.resolve(inputPath);
  const outputPath = resolvedInput.replace(/\.[^.]+$/, ".transcript.json");

  console.log(`Transcribing: ${resolvedInput}`);
  console.log(`Model: ${WHISPER_MODEL} (${WHISPER_VERSION})`);

  const result = await transcribe({
    inputPath: resolvedInput,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: WHISPER_VERSION,
    model: WHISPER_MODEL,
    modelFolder: MODEL_DIR,
    tokenLevelTimestamps: true,
    printOutput: false,
    onProgress: (p) => process.stdout.write(`\r  ${(p * 100).toFixed(1)}%`),
  });

  process.stdout.write("\n");

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nTranscript written to: ${outputPath}`);

  // Print a readable summary
  console.log("\n--- Segments ---");
  for (const segment of result.transcription) {
    console.log(`[${segment.timestamps.from} → ${segment.timestamps.to}] ${segment.text.trim()}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
