import { Composition } from "remotion";
import { TextTornadoComposition, TextTornadoSchema } from "./TextTornadoComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TextTornado"
      component={TextTornadoComposition}
      durationInFrames={300}
      fps={24}
      width={720}
      height={1280}
      schema={TextTornadoSchema}
      defaultProps={{
        contentType: "text",
        words: ["福", "禄", "寿", "喜", "财", "旺"],
        particleCount: 60,
        baseRadius: 280,
        topRadius: 40,
        rotationSpeed: 2.5,
        zoomIntensity: 0.6,
        backgroundColor: "#0a0a15",
        audio: {
          enabled: false,
        },
        textStyle: {
          color: "#FFD700",
          effect: "gold3d",
          effectIntensity: 0.9,
        },
        fontSizeRange: [40, 80],
        imageSizeRange: [50, 100],
        blessingSizeRange: [40, 80],
        liftSpeed: 0.3,
        funnelHeight: 0.85,
        entranceDuration: 30,
        swirlIntensity: 1,
        seed: 42,
      }}
    />
  );
};