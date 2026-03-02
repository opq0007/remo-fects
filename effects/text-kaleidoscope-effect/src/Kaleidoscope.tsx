import React, { useMemo } from "react";
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
  Easing
} from "remotion";
import { seededRandom, BlessingSymbolType, SingleBlessingSymbol } from "../../shared/index";

/**
 * 内容项目类型
 */
type ContentType = "text" | "image" | "blessing";

/**
 * 万花筒单个元素
 */
interface KaleidoscopeItem {
  id: number;
  contentType: ContentType;
  content: string;       // 文字内容或祝福类型
  // 2D 圆形扩散参数
  angle: number;         // 从中心出发的角度
  startRadius: number;   // 起始半径（小，靠近中心）
  endRadius: number;     // 结束半径（大，远离中心）
  // 动画参数
  startTime: number;     // 出现时间
  duration: number;      // 动画时长
  rotationOffset: number; // 自身旋转偏移
  // 视觉参数
  fontSize: number;
  color: string;
  glowColor: string;
  layer: number;
}

interface KaleidoscopeProps {
  // 混合输入
  contentItems: Array<{ type: ContentType; content: string }>;
  colors: string[];
  glowColor: string;
  baseFontSize: number;
  itemCount: number;
  ringCount: number;        // 圆环数量
  rotationSpeed: number;
  expansionDuration: number; // 扩散动画时长
  fadeInDuration: number;
  stayDuration: number;
  startFrame: number;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
  // blessing 样式
  blessingStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    enable3D?: boolean;
    enableGlow?: boolean;
    glowIntensity?: number;
  };
}

/**
 * 单个文字元素组件 - 使用 React.memo 优化性能
 */
const KaleidoscopeItemComponent = React.memo<{
  item: KaleidoscopeItem;
  frame: number;
  width: number;
  height: number;
  enableGlow: boolean;
  glowIntensity: number;
  globalRotation: number;
  blessingStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    enable3D?: boolean;
    enableGlow?: boolean;
    glowIntensity?: number;
  };
}>(({ 
  item, 
  frame, 
  width, 
  height, 
  enableGlow,
  glowIntensity,
  globalRotation,
  blessingStyle,
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 计算元素生命周期进度
  const elementFrame = frame - item.startTime;
  
  if (elementFrame < 0) return null;
  
  // 扩散动画进度 (0 -> 1)
  const progress = interpolate(
    elementFrame,
    [0, item.duration],
    [0, 1],
    { extrapolateRight: "extend" as const, extrapolateLeft: "clamp" as const }
  );
  
  // 缓动函数：先快后慢（从中心向外扩散）
  const easedProgress = Easing.out(Easing.cubic)(progress);
  
  // 计算当前半径（从中心向外）
  const currentRadius = interpolate(
    easedProgress,
    [0, 1],
    [item.startRadius, item.endRadius],
    { extrapolateRight: "extend" as const, extrapolateLeft: "clamp" as const }
  );
  
  // 应用全局旋转 + 元素自身旋转
  const currentAngle = item.angle + globalRotation + item.rotationOffset * progress * 0.5;
  
  // 转换为笛卡尔坐标
  const x = centerX + Math.cos(currentAngle) * currentRadius;
  const y = centerY + Math.sin(currentAngle) * currentRadius;
  
  // 元素出现时的淡入效果
  const fadeIn = interpolate(
    elementFrame,
    [0, 15],
    [0, 1],
    { extrapolateRight: "extend" as const, extrapolateLeft: "clamp" as const }
  );
  
  // 元素离开时的淡出效果（接近终点时）
  const fadeOut = interpolate(
    progress,
    [0.9, 1],
    [1, 0],
    { extrapolateRight: "clamp" as const, extrapolateLeft: "extend" as const }
  );
  
  const opacity = fadeIn * fadeOut;
  
  // 根据距离计算缩放（远的稍小，近的稍大）
  const distanceScale = interpolate(currentRadius, [0, Math.max(width, height) * 0.5], [1.2, 0.7], { extrapolateRight: "clamp" as const, extrapolateLeft: "extend" as const });
  
  // 计算最终字体大小
  const finalFontSize = item.fontSize * distanceScale;
  
  // 计算旋转角度（文字自身旋转，增加动感）
  const textRotation = interpolate(progress, [0, 1], [0, item.rotationOffset * 60]);
  
  // 发光效果
  const adjustedGlow = glowIntensity * 0.8;
  const textShadow = enableGlow
    ? `
        0 0 ${8 * adjustedGlow}px ${item.glowColor},
        0 0 ${16 * adjustedGlow}px ${item.glowColor},
        0 0 ${32 * adjustedGlow}px ${item.glowColor}
      `
    : 'none';
  
  // 渲染祝福图案
  if (item.contentType === "blessing") {
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${textRotation}deg) scale(${distanceScale})`,
          opacity,
          willChange: "transform, opacity",
        }}
      >
        <SingleBlessingSymbol
          type={item.content as BlessingSymbolType}
          size={finalFontSize * 1.2}
          primaryColor={blessingStyle?.primaryColor ?? item.color}
          secondaryColor={blessingStyle?.secondaryColor ?? item.glowColor}
          enable3D={blessingStyle?.enable3D ?? true}
          enableGlow={blessingStyle?.enableGlow ?? enableGlow}
          glowIntensity={blessingStyle?.glowIntensity ?? adjustedGlow}
        />
      </div>
    );
  }
  
  // 渲染文字
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
        fontSize: finalFontSize,
        fontWeight: "bold",
        color: item.color,
        textShadow,
        opacity,
        whiteSpace: "nowrap",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        willChange: "transform, opacity",
      }}
    >
      {item.content}
    </div>
  );
});

/**
 * 万花筒主组件 - 从中心向外圆形扩散
 */
export const Kaleidoscope: React.FC<KaleidoscopeProps> = ({
  contentItems,
  colors,
  glowColor,
  baseFontSize,
  itemCount,
  ringCount,
  rotationSpeed,
  expansionDuration,
  fadeInDuration,
  stayDuration,
  startFrame,
  enable3D,
  enableGlow,
  glowIntensity,
  blessingStyle,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 全局旋转角度（整体缓慢旋转）
  const globalRotation = interpolate(
    frame,
    [0, 360],
    [0, Math.PI * 2 * rotationSpeed],
    { extrapolateRight: "extend" as const }
  );
  
  // 最大扩散半径
  const maxRadius = Math.min(width, height) * 0.5;
  
  // 生成万花筒元素 - 圆环分布
  const items = useMemo(() => {
    const result: KaleidoscopeItem[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      // 计算圆环层级
      const ring = i % ringCount;
      const indexInRing = Math.floor(i / ringCount);
      const itemsPerRing = Math.ceil(itemCount / ringCount);
      
      // 圆形分布角度
      const angleStep = (Math.PI * 2) / itemsPerRing;
      const baseAngle = indexInRing * angleStep + (ring / ringCount) * (angleStep / 2); // 层间偏移
      
      // 随机化
      const random1 = seededRandom(`kaleidoscope-${i}-angle`);
      const random2 = seededRandom(`kaleidoscope-${i}-radius`);
      const random3 = seededRandom(`kaleidoscope-${i}-size`);
      
      const angleOffset = (random1 - 0.5) * 0.4;
      const angle = baseAngle + angleOffset;
      
      // 起始半径（靠近中心）和结束半径（远离中心）
      const startRadius = maxRadius * 0.05 * (1 + random2 * 0.5);
      const endRadius = maxRadius * (0.3 + (ring / ringCount) * 0.5 + random2 * 0.15);
      
      // 波浪式出现（按圆环顺序）
      const ringDelay = (ring / ringCount) * fadeInDuration * 0.6;
      const itemDelay = (indexInRing / itemsPerRing) * fadeInDuration * 0.3;
      const startTime = startFrame + ringDelay + itemDelay + i * 1.5;
      
      // 获取内容项
      const contentItem = contentItems[i % contentItems.length];
      
      result.push({
        id: i,
        contentType: contentItem.type,
        content: contentItem.content,
        angle,
        startRadius,
        endRadius,
        startTime,
        duration: expansionDuration + (random2 - 0.5) * expansionDuration * 0.2,
        rotationOffset: (random1 - 0.5) * 1.5,
        fontSize: baseFontSize * (0.6 + random3 * 0.8),
        color: colors[i % colors.length],
        glowColor,
        layer: ring,
      });
    }
    
    return result;
  }, [contentItems, colors, glowColor, baseFontSize, itemCount, ringCount, maxRadius, startFrame, fadeInDuration, expansionDuration]);
  
  return (
    <AbsoluteFill>
      {items.map((item) => (
        <KaleidoscopeItemComponent
          key={item.id}
          item={item}
          frame={frame}
          width={width}
          height={height}
          enableGlow={enableGlow}
          glowIntensity={glowIntensity}
          globalRotation={globalRotation}
          blessingStyle={blessingStyle}
        />
      ))}
    </AbsoluteFill>
  );
};

export default Kaleidoscope;
