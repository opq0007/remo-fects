import React from "react";
import { Composition } from "remotion";
import { TextBreakthroughComposition, TextBreakthroughCompositionSchema } from "./TextBreakthroughComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextBreakthrough"
        component={TextBreakthroughComposition}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        schema={TextBreakthroughCompositionSchema}
        defaultProps={{
          // 文字组配置
          textGroups: [
            {
              texts: ["平安喜乐"],
              groupDelay: 48,
            },
            {
              texts: ["健康成长"],
              groupDelay: 48,
            },
            {
              texts: ["一马平川"],
              groupDelay: 48,
            },
            {
              texts: ["福禄寿喜"],
              groupDelay: 60,
            },
          ],

          // 字体配置
          fontSize: 120,
          fontFamily: "PingFang SC, Microsoft YaHei, SimHei, sans-serif",
          fontWeight: 900,

          // 烫金色3D立体发光效果
          textColor: "#ffd700",
          glowColor: "#ffaa00",
          secondaryGlowColor: "#ff6600",
          glowIntensity: 1.5,
          bevelDepth: 3,

          // 3D透视参数
          startZ: 2000,
          endZ: -100,

          // 动画时长
          approachDuration: 45,
          breakthroughDuration: 20,
          holdDuration: 40,

          // 冲击效果
          impactScale: 1.4,
          impactRotation: 12,
          shakeIntensity: 10,

          // 组间延迟
          groupInterval: 50,

          // 运动方向：bottom-up 从下往上（默认），top-down 从上往下
          direction: "top-down", // 取消注释可切换为从上往下
          enableFallDown: true,

          // 背景
          backgroundType: "image",
          backgroundSource: "佛陀1.png",

          // 遮罩
          overlayColor: "#000000",
          overlayOpacity: 0.1,
        }}
      />
    </>
  );
};
