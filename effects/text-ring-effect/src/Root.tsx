import { Composition, Folder } from "remotion";
import {
  TextRingComposition,
  TextRingCompositionSchema,
} from "./TextRingComposition";

const defaultWords = [
  "平安喜乐",
  "万事如意",
  "福禄寿喜"
];

const positionWords = [
  "平安喜乐",
  "万事如意",
  "福禄寿喜",
  "财源广进",
  "吉祥如意",
  "心想事成",
  "鸿运当头",
  "幸福美满"
];

// 混合输入默认参数
const defaultMixedInput = {
  contentType: "text" as const,
  images: [],
  blessingTypes: [],
  imageWeight: 0.5,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="GoldTextRing">
        <Composition
          id="TextRing"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={720}
          height={1280}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: defaultWords,
            fontSize: 70,
            opacity: 1,
            ringRadius: 250,
            rotationSpeed: 0.8,
            seed: 42,
            glowIntensity: 0.9,
            depth3d: 8,
            cylinderHeight: 400,
            perspective: 1000,
            mode: "vertical",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.25,
            },
            watermark: {
              enabled: true,
              text: "© Remo-Fects",
              fontSize: 24,
              color: "#ffffff",
              opacity: 0.35,
              speed: 1,
              intensity: 0.8,
            },
            marquee: {
              enabled: true,
              foreground: {
                texts: [{ text: "恭喜发财" }, { text: "财源广进" }, { text: "万事如意" }, { text: "心想事成" }],
                fontSize: 48,
                opacity: 0.9,
                textStyle: { color: "#ffd700", effect: "gold3d" },
              },
              background: {
                texts: [{ text: "新春快乐" }, { text: "阖家幸福" }, { text: "身体健康" }, { text: "工作顺利" }, { text: "步步高升" }],
                fontSize: 24,
                opacity: 0.5,
                textStyle: { color: "#ffaa00", effect: "shadow" },
              },
              orientation: "horizontal",
              direction: "right-to-left",
              speed: 100,
            },
          }}
        />

        <Composition
          id="TextRingFast"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={720}
          height={1280}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: defaultWords,
            fontSize: 65,
            opacity: 1,
            ringRadius: 230,
            rotationSpeed: 1,
            seed: 42,
            glowIntensity: 0.8,
            depth3d: 6,
            cylinderHeight: 350,
            perspective: 900,
            mode: "vertical",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.25,
            },
          }}
        />

        <Composition
          id="TextRingVertical"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={1080}
          height={1920}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: defaultWords,
            fontSize: 90,
            opacity: 1,
            ringRadius: 400,
            rotationSpeed: 0.6,
            seed: 42,
            glowIntensity: 1,
            depth3d: 10,
            cylinderHeight: 600,
            perspective: 1500,
            mode: "vertical",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.2,
            },
          }}
        />

        <Composition
          id="TextRingHorizontal"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={1920}
          height={1080}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: defaultWords,
            fontSize: 70,
            opacity: 1,
            ringRadius: 350,
            rotationSpeed: 0.7,
            seed: 42,
            glowIntensity: 0.9,
            depth3d: 8,
            cylinderHeight: 400,
            perspective: 1200,
            mode: "vertical",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.25,
            },
          }}
        />

        <Composition
          id="TextRingBlessing"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={1080}
          height={1920}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: [
              "身体健康",
              "平安喜乐",
              "万事如意",
              "福星高照",
              "财源滚滚",
              "事业有成",
              "家庭和睦",
              "好运连连"
            ],
            fontSize: 60,
            opacity: 1,
            ringRadius: 380,
            rotationSpeed: 0.7,
            seed: 42,
            glowIntensity: 1,
            depth3d: 10,
            cylinderHeight: 800,
            perspective: 1200,
            mode: "vertical",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.2,
            },
          }}
        />

        {/* 方位模式预设 */}
        <Composition
          id="TextRingPositions4"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={720}
          height={1280}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: positionWords.slice(0, 4),
            fontSize: 70,
            opacity: 1,
            ringRadius: 250,
            rotationSpeed: 0.8,
            seed: 42,
            glowIntensity: 0.9,
            depth3d: 8,
            cylinderHeight: 400,
            perspective: 1000,
            mode: "positions",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.25,
            },
          }}
        />

        <Composition
          id="TextRingPositions8"
          component={TextRingComposition}
          durationInFrames={480}
          fps={24}
          width={720}
          height={1280}
          schema={TextRingCompositionSchema}
          defaultProps={{
            ...defaultMixedInput,
            words: positionWords,
            fontSize: 60,
            opacity: 1,
            ringRadius: 400,
            rotationSpeed: 0.7,
            seed: 42,
            glowIntensity: 1,
            depth3d: 10,
            cylinderHeight: 600,
            perspective: 1500,
            mode: "positions",
            verticalPosition: 0.5,
            
            // 嵌套参数
            background: {
              type: "color",
              color: "#1a0a00",
            },
            overlay: {
              color: "#000000",
              opacity: 0.2,
            },
          }}
        />
      </Folder>
    </>
  );
};
