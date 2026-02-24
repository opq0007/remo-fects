import { Composition, Folder } from "remotion";
import {
  TextRainComposition,
  TextRainCompositionSchema,
} from "./TextRainComposition";

// 默认文字列表
const defaultWords = [
  "一马平川",
  "平安喜乐",
  "万事如意",
  "健康成长",
  "马到成功",
];

// 默认图片列表 (PNG透明图片)
const defaultImages = [
  "gold-ingot.png",    // 金元宝
  "ancient-coin.png",  // 穿孔钱
  "gold-coin.png",     // 金币
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TextRain">
        {/* 主要的文字雨组合 - 烫金3D效果 (横排) */}
        <Composition
          id="TextRain"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            textDirection: "vertical",
            density: 2,
            fallSpeed: 0.17,
            fontSizeRange: [64, 120],
            imageSizeRange: [80, 150],
            opacityRange: [0.5, 0.95],
            rotationRange: [-10, 10],
            seed: 42,
            laneCount: 12,
            minVerticalGap: 100,
            textStyle: {
              color: "#ffd700",
              effect: "gold3d",
              effectIntensity: 0.9,
              fontWeight: 700,
              letterSpacing: 2,
            },
            backgroundType: "image",
            backgroundSource: "熊猫.png",
            backgroundColor: "#1a1a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.2,
          }}
        />

        {/* 预设：竖排文字雨 - 烫金3D效果 */}
        <Composition
          id="TextRainVertical"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            textDirection: "vertical",
            density: 1.5,
            fallSpeed: 0.12,
            fontSizeRange: [180, 320],
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
          }}
        />

        {/* 预设：金元宝下雨特效 */}
        <Composition
          id="ImageRainGold"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            images: ["gold-ingot.png", "gold-coin.png"],
            contentType: "image",
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.2,
            fontSizeRange: [60, 120],
            imageSizeRange: [80, 160],
            opacityRange: [0.7, 1],
            rotationRange: [-20, 20],
            seed: 100,
            laneCount: 8,
            minVerticalGap: 120,
            imageStyle: {
              glow: true,
              glowColor: "#ffd700",
              glowIntensity: 0.8,
              shadow: true,
              shadowBlur: 20,
              shadowColor: "rgba(0,0,0,0.5)",
              swing: true,
              swingAngle: 15,
              swingSpeed: 2,
              spin: false,
            },
            backgroundType: "color",
            backgroundColor: "#1a0a1a",
            overlayColor: "#000000",
            overlayOpacity: 0.3,
          }}
        />

        {/* 预设：古铜钱下雨特效 */}
        <Composition
          id="ImageRainCoins"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            images: ["ancient-coin.png", "copper-coin.png"],
            contentType: "image",
            textDirection: "horizontal",
            density: 3,
            fallSpeed: 0.15,
            fontSizeRange: [50, 100],
            imageSizeRange: [60, 120],
            opacityRange: [0.6, 0.95],
            rotationRange: [-30, 30],
            seed: 200,
            laneCount: 10,
            minVerticalGap: 80,
            imageStyle: {
              glow: true,
              glowColor: "#cd7f32",
              glowIntensity: 0.5,
              shadow: true,
              shadowBlur: 15,
              swing: true,
              swingAngle: 20,
              swingSpeed: 3,
              spin: true,
              spinSpeed: 0.5,
            },
            backgroundType: "color",
            backgroundColor: "#0d0d0d",
            overlayColor: "#1a0a00",
            overlayOpacity: 0.2,
          }}
        />

        {/* 预设：文字+图片混合雨特效 */}
        <Composition
          id="MixedRain"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: ["财源广进", "招财进宝", "恭喜发财", "金玉满堂"],
            images: ["gold-ingot.png", "gold-coin.png", "money-bag.png"],
            contentType: "mixed",
            imageWeight: 0.4,
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.18,
            fontSizeRange: [60, 120],
            imageSizeRange: [70, 140],
            opacityRange: [0.6, 1],
            rotationRange: [-15, 15],
            seed: 300,
            laneCount: 8,
            minVerticalGap: 130,
            textStyle: {
              color: "#ffd700",
              effect: "gold3d",
              effectIntensity: 0.9,
              fontWeight: 700,
            },
            imageStyle: {
              glow: true,
              glowColor: "#ffd700",
              glowIntensity: 0.7,
              shadow: true,
              shadowBlur: 18,
              swing: true,
              swingAngle: 12,
              swingSpeed: 2.5,
            },
            backgroundType: "color",
            backgroundColor: "#0a0a14",
            overlayColor: "#000000",
            overlayOpacity: 0.25,
          }}
        />

        {/* 预设：简约白底 + 浮雕效果 */}
        <Composition
          id="TextRainSimple"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: ["平安喜乐", "万事如意", "心想事成"],
            contentType: "text",
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.27,
            fontSizeRange: [60, 140],
            imageSizeRange: [60, 120],
            opacityRange: [0.6, 1],
            rotationRange: [-5, 5],
            seed: 100,
            laneCount: 6,
            minVerticalGap: 150,
            textStyle: {
              color: "#333333",
              effect: "emboss",
              effectIntensity: 0.8,
              fontWeight: 700,
              letterSpacing: 3,
            },
            backgroundType: "color",
            backgroundColor: "#f5f5f5",
            overlayOpacity: 0,
          }}
        />

        {/* 预设：霓虹发光效果 */}
        <Composition
          id="TextRainNeon"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: ["精彩", "冲刺", "闪耀", "星光", "美好", "温暖"],
            contentType: "text",
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.4,
            fontSizeRange: [72, 150],
            imageSizeRange: [80, 150],
            opacityRange: [0.7, 1],
            rotationRange: [-15, 15],
            seed: 888,
            laneCount: 10,
            minVerticalGap: 120,
            textStyle: {
              color: "#00ffff",
              effect: "neon",
              effectIntensity: 1,
              fontWeight: 700,
              shadowColor: "#ff00ff",
              shadowBlur: 30,
            },
            backgroundType: "color",
            backgroundColor: "#0a0a1a",
            overlayOpacity: 0,
          }}
        />

        {/* 预设：渐变金属效果 */}
        <Composition
          id="TextRainGradient"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: ["前程似锦", "步步高升", "飞黄腾达", "鹏程万里", "大展宏图"],
            contentType: "text",
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.2,
            fontSizeRange: [64, 140],
            imageSizeRange: [80, 150],
            opacityRange: [0.6, 1],
            rotationRange: [-8, 8],
            seed: 555,
            laneCount: 8,
            minVerticalGap: 150,
            textStyle: {
              gradient: {
                type: "linear",
                colors: ["#ffd700", "#ff8c00", "#ff4500"],
                angle: 135,
              },
              effect: "3d",
              effectIntensity: 0.9,
              fontWeight: 800,
              letterSpacing: 4,
            },
            backgroundType: "color",
            backgroundColor: "#1a0a2e",
            overlayColor: "#000000",
            overlayOpacity: 0.3,
          }}
        />

        {/* 预设：复古怀旧效果 */}
        <Composition
          id="TextRainRetro"
          component={TextRainComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          schema={TextRainCompositionSchema}
          defaultProps={{
            words: ["岁月静好", "时光荏苒", "岁月如歌", "初心不改"],
            contentType: "text",
            textDirection: "horizontal",
            density: 2,
            fallSpeed: 0.13,
            fontSizeRange: [60, 130],
            imageSizeRange: [70, 130],
            opacityRange: [0.5, 0.9],
            rotationRange: [-12, 12],
            seed: 333,
            laneCount: 8,
            minVerticalGap: 130,
            textStyle: {
              color: "#d4a574",
              effect: "retro",
              effectIntensity: 0.9,
              fontWeight: 700,
              letterSpacing: 5,
            },
            backgroundType: "color",
            backgroundColor: "#2d1f14",
            overlayColor: "#1a120a",
            overlayOpacity: 0.2,
          }}
        />
      </Folder>
    </>
  );
};
