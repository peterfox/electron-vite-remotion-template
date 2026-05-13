import type { CalculateMetadataFunction } from "remotion";
import type { CodeCompositionProps } from "../../types/composition-script";
import { tokenizeCode } from "./tokenize";

// Runs before the composition mounts — resolves duration and tokenizes code.
// This is the only place tokenization happens; components receive plain data.
const calculateCodeMetadata: CalculateMetadataFunction<CodeCompositionProps> = async ({
  props,
}) => {
  const tokenizedLines = tokenizeCode(
    props.code,
    props.language,
    props.brandKit.syntaxTheme
  );

  // Duration = end of the last sequence + 1s tail, minimum 5s
  const lastFrame = props.sequences.reduce((max, seq) => {
    return Math.max(max, seq.from + seq.durationInFrames);
  }, 0);

  const durationInFrames = Math.max(lastFrame + props.fps, props.fps * 5);

  return {
    fps: props.fps,
    durationInFrames,
    width: 1920,
    height: 1080,
    props: {
      ...props,
      tokenizedLines,
      durationInFrames,
    },
  };
};

export default calculateCodeMetadata;
