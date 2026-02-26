import { Composition } from "remotion";
import { TextGrowExplodeComposition, TextGrowExplodeCompositionSchema } from "./TextGrowExplodeComposition";

/**
 * 生成极简轮廓点数据
 * 根据姓名长度动态调整粒子数量，避免文字堆叠
 * 
 * 优化策略：
 * - 减少圆周点数量到 16 个，确保间距足够
 * - 增大半径到 42%，让圆周更大
 * - 字体大小 24px，"张三丰"约 72px 宽
 * - 周长约 1900px / 16 点 ≈ 118px 间距，足够容纳文字
 */
function generateDefaultContourPoints(width: number, height: number) {
  const points: Array<{ x: number; y: number; opacity: number }> = [];
  const centerX = width / 2;
  const centerY = height / 2;
  // 增大半径到 42%，让圆周更大
  const radius = Math.min(width, height) * 0.42;

  // 精简到 17 个点（16 个圆周点 + 1 个中心点）
  // 周长 1900px / 17 ≈ 112px 间距，足够容纳 72px 宽的文字
  const totalPoints = 16;
  const angleStep = (Math.PI * 2) / totalPoints;
  
  for (let i = 0; i < totalPoints; i++) {
    const angle = angleStep * i;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push({ 
      x: Math.round(x), 
      y: Math.round(y), 
      opacity: 0.9 
    });
  }

  // 添加中心点
  points.push({ x: centerX, y: centerY, opacity: 1 });

  return points;
}

// 预计算极简轮廓点（17 个点：16 个圆周 + 1 个中心）
const defaultContourPoints = generateDefaultContourPoints(720, 1280);

/**
 * Remotion Root 组件
 * 定义所有可用的 Composition
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextGrowExplode"
        component={TextGrowExplodeComposition}
        durationInFrames={240}
        fps={24}
        width={720}
        height={1280}
        schema={TextGrowExplodeCompositionSchema}
        defaultProps={{
          // 核心输入
          name: "张三丰",
          words: ["幸福", "健康", "快乐", "成长", "发财", "暴富", "幸运"],
          imageSource: "福字.png",

          // 预计算的轮廓点数据
          contourPointsData: defaultContourPoints,

          // 阶段时长配置
          growDuration: 90,
          holdDuration: 30,
          explodeDuration: 30,
          fallDuration: 90,

          // 文字样式
          fontSize: 24,  // 生长文字字体（适中大小，确保清晰）
          particleFontSize: 36,  // 爆炸粒子字体
          textColor: "#ffd700",
          glowColor: "#ffaa00",
          glowIntensity: 1,

          // 粒子配置
          particleCount: 80,
          gravity: 0.15,
          wind: 0,

          // 轮廓提取
          threshold: 128,
          sampleDensity: 6,

          // 生长样式
          growStyle: "tree",

          // 背景
          backgroundColor: "#0a0a1a",
          backgroundOpacity: 0.9,
          // 爆炸背景透明度（0.4 = 40% 透明，让烟花更突出）
          explodeBackgroundOpacity: 0.4,

          // 随机种子
          seed: 42,
        }}
      />
    </>
  );
};