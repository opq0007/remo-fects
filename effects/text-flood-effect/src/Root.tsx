/**
 * 文字洪水特效入口
 * 
 * 定义多个预设组合，供 Remotion Studio 预览和 API 调用
 */

import { Composition, Folder } from "remotion";
import {
  TextFloodComposition,
  TextFloodCompositionSchema,
} from "./TextFloodComposition";

// 默认文字列表
const defaultWords = [
  "洪",
  "福",
  "财",
  "运",
  "吉",
  "祥",
];

/**
 * TextFlood 特效预设
 * 
 * 预设说明：
 * - TextFlood: 主要洪水效果（蓝色科技风，从远到近）
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TextFlood">
        {/* 1. 主要的洪水效果 - 蓝色科技风，从远到近 */}
        <Composition
          id="TextFlood"
          component={TextFloodComposition}
          durationInFrames={300}
          fps={24}
          width={720}
          height={1280}
          schema={TextFloodCompositionSchema}
          defaultProps={{
            words: defaultWords,
            contentType: "text",
            particleCount: 60,
            waveCount: 5,
            direction: "toward",
            fontSizeRange: [60, 120],
            imageSizeRange: [80, 150],
            opacityRange: [0.7, 1],
            seed: 42,
            waveConfig: {
              waveSpeed: 1.5,
              waveAmplitude: 60,
              waveFrequency: 2,
            },
            impactConfig: {
              impactStart: 0.7,
              impactScale: 3,
              impactBlur: 8,
              impactShake: 15,
            },
            textStyle: {
              color: "#00d4ff",
              effect: "glow",
              effectIntensity: 1.2,
              fontWeight: 900,
            },
            enablePerspective: true,
            perspectiveStrength: 800,
            enableWaveBackground: true,
            waveBackgroundColor: "#0a3a5a",
            waveBackgroundOpacity: 0.4,
            backgroundType: "color",
            backgroundColor: "#050a15",
            overlayColor: "#000000",
            overlayOpacity: 0.1,

            // 水印配置
            watermarkEnabled: true,
            watermarkText: "© Remo-Fects",
            watermarkFontSize: 24,
            watermarkColor: "#00d4ff",
            watermarkOpacity: 0.4,
            watermarkSpeed: 1,
            watermarkIntensity: 0.8,
            watermarkVelocityX: 180,
            watermarkVelocityY: 120,

            // 音频配置
            audio: {
              enabled: true,
              src: "coin-sound.mp3",
              volume: 0.6,
              loop: true,
            },
          }}
        />
      </Folder>
    </>
  );
};
