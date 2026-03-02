import { Composition } from "remotion";
import { TextVortexComposition, TextVortexSchema } from "./TextVortexComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TextVortex"
      component={TextVortexComposition}
      durationInFrames={300}
      fps={24}
      width={720}
      height={1280}
      schema={TextVortexSchema}
      defaultProps={{
        contentType: "text",
        words: ["福", "禄", "寿", "喜", "财", "旺", "吉", "祥"],
        particleCount: 80,
        ringCount: 6,
        rotationDirection: "clockwise",
        rotationSpeed: 1.5,
        expansionDuration: 6,
        initialRadius: 30,
        maxRadius: 350,
        depth3D: true,
        depthIntensity: 0.4,
        perspective: 800,
        backgroundColor: "#0a0a15",
        audio: {
          enabled: false,
        },
        textStyle: {
          color: "#FFD700",
          effect: "gold3d",
          effectIntensity: 0.9,
        },
        fontSizeRange: [30, 70],
        imageSizeRange: [40, 90],
        blessingSizeRange: [30, 70],
        entranceDuration: 25,
        fadeInEnabled: true,
        spiralTightness: 1.2,
        pulseEnabled: true,
        pulseIntensity: 0.15,
        shockwaveEnabled: true,
        shockwaveTiming: 3,
        suctionEffect: true,
        suctionIntensity: 0.3,
        seed: 42,
      }}
    />
  );
};
