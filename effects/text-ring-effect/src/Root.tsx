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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.25,

            // 水印配置
            watermarkEnabled: true,
            watermarkText: "© Remo-Fects",
            watermarkFontSize: 24,
            watermarkColor: "#ffffff",
            watermarkOpacity: 0.35,
            watermarkSpeed: 1,
            watermarkIntensity: 0.8,
            watermarkVelocityX: 180,
            watermarkVelocityY: 120,

            // 走马灯配置
            marqueeEnabled: true,
            marqueeForegroundTexts: ["恭喜发财", "财源广进", "万事如意", "心想事成"],
            marqueeForegroundFontSize: 48,
            marqueeForegroundOpacity: 0.9,
            marqueeForegroundColor: "#ffd700",
            marqueeForegroundEffect: "gold3d",
            marqueeBackgroundTexts: ["新春快乐", "阖家幸福", "身体健康", "工作顺利", "步步高升"],
            marqueeBackgroundFontSize: 24,
            marqueeBackgroundOpacity: 0.5,
            marqueeBackgroundColor: "#ffaa00",
            marqueeBackgroundEffect: "shadow",
            marqueeOrientation: "horizontal",
            marqueeDirection: "right-to-left",
            marqueeSpeed: 100,
            marqueeSpacing: 80,
            marqueeForegroundOffsetY: 300,
            marqueeBackgroundOffsetY: -200,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.25,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.2,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.25,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.2,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.25,
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
            backgroundType: "color",
            backgroundColor: "#1a0a00",
            overlayColor: "#000000",
            overlayOpacity: 0.2,
          }}
        />
      </Folder>
    </>
  );
};