import "../App.css";

import { Composition } from "remotion";
import type { CodeCompositionProps } from "../types/composition-script";
import calculateCodeMetadata from "./code-video/calculate-metadata";
import { CodeComposition } from "./code-video/CodeComposition";
import { sampleScript } from "./code-video/sample-script";
import calculateRemotionMetadata from "./calculate-remotion-metadata";
import { HelloWorld, myCompSchema } from "./video/HelloWorld";

function RemotionRoot() {
  // Default props for CodeComposition. calculateMetadata fills in
  // tokenizedLines and resolves durationInFrames before first render.
  const codeCompositionDefaults: CodeCompositionProps = {
    ...sampleScript,
    tokenizedLines: [], // populated by calculateMetadata
    durationInFrames: 150, // overridden by calculateMetadata
  };

  return (
    <>
      <Composition
        id="CodeVideo"
        component={CodeComposition}
        defaultProps={codeCompositionDefaults}
        calculateMetadata={calculateCodeMetadata}
        // Fallback dimensions — overridden by calculateMetadata
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="HelloWorld"
        component={HelloWorld}
        schema={myCompSchema}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
          metadata: {
            durationInFrames: 150,
            compositionWidth: 1920,
            compositionHeight: 1080,
            fps: 30,
          },
        }}
        calculateMetadata={calculateRemotionMetadata}
      />
    </>
  );
}

export default RemotionRoot;
