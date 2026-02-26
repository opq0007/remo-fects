import React from "react";
import { Composition } from "remotion";
import { TextBreakthroughComposition, TextBreakthroughCompositionSchema } from "./TextBreakthroughComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextBreakthrough"
        component={TextBreakthroughComposition}
        durationInFrames={480}
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
              texts: ["财源滚滚"],
              groupDelay: 48,
            },
            {
              texts: ["马上有钱"],
              groupDelay: 60,
            },
          ],

          // 文字最终定格位置配置
          finalPosition: {
            // 默认位置（画面中心为 0,0，x 范围 -0.5 到 0.5，y 范围 -0.5 到 0.5）
            defaultX: 0,    // 水平居中
            defaultY: 0,    // 垂直居中
            // 每个文字组的独立位置（可选，覆盖默认位置）
            groupPositions: [
              { x: 0, y: -0.3, arrangement: "circular" },      // 第一组：上方居中，圆形排列
              { x: -0.15, y: -0.1, arrangement: "horizontal" }, // 第二组：左上，水平排列
              { x: 0.15, y: 0.1, arrangement: "horizontal" },   // 第三组：右下，水平排列
              { x: 0, y: 0.3, arrangement: "circular" },        // 第四组：下方居中，圆形排列
            ],
            // 自动排列方式（当组内未指定时使用）
            autoArrangement: "circular",  // horizontal / vertical / circular / stacked
            autoArrangementSpacing: 0.25, // 排列间距
          },

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
          backgroundSource: "财神2.png",

          // 遮罩
          overlayColor: "#000000",
          overlayOpacity: 0.1,

          // 音效配置
          audioEnabled: true,              // 是否启用背景音效
          audioSource: "coin-sound.mp3",    // 音效文件路径
          audioVolume: 0.5,                 // 音量（0-2，1为正常音量）
        }}
      />
    </>
  );
};
