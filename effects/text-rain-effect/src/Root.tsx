import { Composition, Folder } from "remotion";
import {
  TextRainComposition,
  TextRainCompositionSchema,
} from "./TextRainComposition";

// 默认文字列表
const defaultWords = [
  "平安喜乐",
  "万事如意",
  "健康成长"
];

/**
 * TextRain 特效预设
 * 
 * 本文件包含 4 个代表性预设，更多效果可在 Remotion Studio 中在线调整参数预览。
 * 
 * 预设说明：
 * - TextRain: 主要文字雨效果（烫金3D风格）
 * - TextRainFast: 快速渲染版本（适合测试）
 * - BlessingRain: 祝福图案雨（金元宝、金币、莲花等）
 * - TextRainVertical: 竖排文字雨
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TextRain">
        {/* 1. 主要的文字雨组合 - 烫金3D效果 */}
        {/* 【性能提示】此预设使用图片背景，渲染较慢。如需快速渲染，请使用 TextRainFast 预设 */}
        <Composition
          id="TextRain"
          component={TextRainComposition}
          durationInFrames={480}
          fps={24}
          width={720}
          height={1280}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            textDirection: "vertical",
            density: 2,
            fallSpeed: 0.15,
            fontSizeRange: [60, 60],
            imageSizeRange: [80, 150],
            opacityRange: [0.5, 0.95],
            rotationRange: [-10, 10],
            seed: 42,
            laneCount: 4,
            minVerticalGap: 100,
            textStyle: {
              color: "#ffd700",
              effect: "gold3d",
              effectIntensity: 0.9,
              fontWeight: 1000,
              letterSpacing: 2,
            },
            backgroundType: "image",
            backgroundSource: "熊猫.png",
            backgroundColor: "#1a1a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.2,

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
          }}
        />

        {/* 2. 【优化预设】快速渲染版本 - 适合测试和快速出片 */}
        <Composition
          id="TextRainFast"
          component={TextRainComposition}
          durationInFrames={180}
          fps={24}
          width={720}
          height={1280}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            textDirection: "vertical",
            density: 1.5,
            fallSpeed: 0.2,
            fontSizeRange: [60, 60],
            imageSizeRange: [80, 120],
            opacityRange: [0.5, 0.95],
            rotationRange: [-5, 5],
            seed: 42,
            laneCount: 4,
            minVerticalGap: 120,
            textStyle: {
              color: "#ffd700",
              effect: "shadow",
              effectIntensity: 0.8,
              fontWeight: 800,
              letterSpacing: 2,
            },
            backgroundType: "color",
            backgroundColor: "#1a1a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.2,

            watermarkEnabled: true,
            watermarkText: "© Remo-Fects",
            watermarkFontSize: 24,
            watermarkColor: "#ffffff",
            watermarkOpacity: 0.35,
            watermarkSpeed: 1,
            watermarkIntensity: 0.8,
            watermarkVelocityX: 180,
            watermarkVelocityY: 120,
          }}
        />

        {/* 3. 祝福图案雨 - 使用 BlessingSymbol 组件生成金元宝、金币、莲花等 */}
        <Composition
          id="BlessingRain"
          component={TextRainComposition}
          durationInFrames={300}
          fps={24}
          width={720}
          height={1280}
          schema={TextRainCompositionSchema}
          defaultProps={{
            contentType: "blessing",
            textDirection: "horizontal",
            // 祝福图案类型：金币、金钱袋、福袋、红包
            blessingTypes: ["goldCoin", "moneyBag", "luckyBag", "redPacket"],
            blessingStyle: {
              primaryColor: "#FFD700",
              secondaryColor: "#FFA500",
              enable3D: true,
              enableGlow: true,
              glowIntensity: 1,
              animated: false,
            },
            density: 1.5,
            fallSpeed: 0.18,
            fontSizeRange: [60, 100],
            imageSizeRange: [60, 120],
            opacityRange: [0.7, 1],
            rotationRange: [-20, 20],
            seed: 2026,
            laneCount: 6,
            minVerticalGap: 100,
            backgroundType: "color",
            backgroundColor: "#1a0a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.15,

            watermarkEnabled: true,
            watermarkText: "© Remo-Fects",
            watermarkFontSize: 24,
            watermarkColor: "#ffd700",
            watermarkOpacity: 0.35,
            watermarkSpeed: 1,
            watermarkIntensity: 0.8,
            watermarkVelocityX: 180,
            watermarkVelocityY: 120,
          }}
        />

        {/* 4. 竖排文字雨 - 烫金3D效果 */}
        <Composition
          id="TextRainVertical"
          component={TextRainComposition}
          durationInFrames={240}
          fps={24}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            textDirection: "vertical",
            density: 1.2,
            fallSpeed: 0.12,
            fontSizeRange: [60, 100],
            imageSizeRange: [80, 150],
            opacityRange: [0.6, 1],
            rotationRange: [0, 0],
            seed: 42,
            laneCount: 5,
            minVerticalGap: 60,
            textStyle: {
              color: "#ffd700",
              effect: "gold3d",
              effectIntensity: 1,
              fontWeight: 800,
              letterSpacing: 6,
            },
            backgroundType: "image",
            backgroundSource: "熊猫.png",
            backgroundColor: "#1a1a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.2,

            watermarkEnabled: true,
            watermarkText: "© Remo-Fects",
            watermarkFontSize: 24,
            watermarkColor: "#ffffff",
            watermarkOpacity: 0.35,
            watermarkSpeed: 1,
            watermarkIntensity: 0.8,
            watermarkVelocityX: 180,
            watermarkVelocityY: 120,
          }}
        />
      </Folder>
    </>
  );
};