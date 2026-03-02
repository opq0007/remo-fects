import React from "react";
import { 
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { 
  SingleBlessingSymbol,
  BlessingSymbolType,
} from "../../shared/index";

/**
 * 叶片内容项类型
 */
export type BladeContentType = "text" | "image" | "blessing";

/**
 * 叶片内容项
 */
export interface BladeContentItem {
  type: BladeContentType;
  content: string;
}

/**
 * 风车叶片配置
 */
export interface WindmillBladeConfig {
  /** 叶片索引 */
  index: number;
  /** 叶片内容项列表（垂直拼接） */
  items: BladeContentItem[];
  /** 叶片颜色 */
  color: string;
  /** 发光颜色 */
  glowColor: string;
  /** 基础字体大小 */
  fontSize: number;
  /** 叶片长度比例 */
  lengthRatio: number;
  /** 出现延迟（帧） */
  appearDelay: number;
}

/**
 * 风车叶片 Props
 */
export interface WindmillBladeProps {
  /** 叶片配置 */
  config: WindmillBladeConfig;
  /** 叶片基础角度（弧度） */
  baseAngle: number;
  /** 中心点 X 坐标 */
  centerX: number;
  /** 中心点 Y 坐标 */
  centerY: number;
  /** 当前旋转角度（弧度） */
  currentRotation: number;
  /** 是否启用发光 */
  enableGlow: boolean;
  /** 发光强度 */
  glowIntensity: number;
  /** 3D 视角倾斜角度（度） */
  tiltAngle: number;
  /** 3D 视角旋转角度（度） */
  rotateY: number;
  /** 透视距离 */
  perspective: number;
  /** 叶片内部元素是否随叶片旋转（false 则保持水平） */
  itemRotateWithBlade: boolean;
  /** 祝福图案样式 */
  blessingStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    enable3D?: boolean;
    enableGlow?: boolean;
    glowIntensity?: number;
  };
}

/**
 * 计算叶片在 3D 空间中的实际位置
 */
function calculate3DPosition(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  tiltAngle: number,
  rotateY: number
): { x: number; y: number; scale: number; opacity: number } {
  // 相对于中心点的偏移
  const dx = x - centerX;
  const dy = y - centerY;
  
  // 将角度转换为弧度
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const rotateYRad = (rotateY * Math.PI) / 180;
  
  // 3D 旋转
  // 1. 绕 X 轴旋转（倾斜）
  const y1 = dy * Math.cos(tiltRad);
  const z1 = dy * Math.sin(tiltRad);
  
  // 2. 绕 Y 轴旋转
  const x2 = dx * Math.cos(rotateYRad) - z1 * Math.sin(rotateYRad);
  const z2 = dx * Math.sin(rotateYRad) + z1 * Math.cos(rotateYRad);
  
  // 透视投影
  const perspective = 1000;
  const scale = perspective / (perspective + z2);
  
  return {
    x: centerX + x2 * scale,
    y: centerY + y1 * scale,
    scale,
    opacity: interpolate(z2, [-500, 0, 500], [0.3, 1, 0.3], { extrapolateRight: "clamp" as const, extrapolateLeft: "clamp" as const }),
  };
}

/**
 * 单个内容项渲染组件
 */
const ContentItemRenderer: React.FC<{
  item: BladeContentItem;
  fontSize: number;
  color: string;
  glowColor: string;
  enableGlow: boolean;
  glowIntensity: number;
  blessingStyle?: WindmillBladeProps["blessingStyle"];
}> = ({ item, fontSize, color, glowColor, enableGlow, glowIntensity, blessingStyle }) => {
  const adjustedGlow = glowIntensity * 0.8;
  const textShadow = enableGlow
    ? `0 0 ${8 * adjustedGlow}px ${glowColor}, 0 0 ${16 * adjustedGlow}px ${glowColor}`
    : "none";

  if (item.type === "blessing") {
    return (
      <SingleBlessingSymbol
        type={item.content as BlessingSymbolType}
        size={fontSize * 1.2}
        primaryColor={blessingStyle?.primaryColor ?? color}
        secondaryColor={blessingStyle?.secondaryColor ?? glowColor}
        enable3D={blessingStyle?.enable3D ?? true}
        enableGlow={blessingStyle?.enableGlow ?? enableGlow}
        glowIntensity={blessingStyle?.glowIntensity ?? adjustedGlow}
      />
    );
  }

  // 文字渲染
  return (
    <div
      style={{
        fontSize,
        fontWeight: "bold",
        color,
        textShadow,
        whiteSpace: "nowrap",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        textAlign: "center",
        lineHeight: 1.2,
      }}
    >
      {item.content}
    </div>
  );
};

/**
 * 风车叶片组件
 * 叶片内容垂直拼接，整体绕中心点旋转
 */
export const WindmillBlade: React.FC<WindmillBladeProps> = ({
  config,
  baseAngle,
  centerX,
  centerY,
  currentRotation,
  enableGlow,
  glowIntensity,
  tiltAngle,
  rotateY,
  perspective,
  itemRotateWithBlade,
  blessingStyle,
}) => {
  const frame = useCurrentFrame();
  
  // 叶片出现动画
  const appearProgress = spring({
    frame: frame - config.appearDelay,
    fps: 24,
    config: {
      damping: 15,
      stiffness: 80,
      mass: 0.8,
    },
  });
  
  // 如果还没开始出现
  if (frame < config.appearDelay) return null;
  
  // 计算叶片的实际角度
  const actualAngle = baseAngle + currentRotation;
  
  // 计算叶片的长度（固定值，不再随机）
  const bladeLength = Math.min(centerX, centerY) * config.lengthRatio;
  
  // 计算每个内容项的位置
  const totalItems = config.items.length;
  const itemSpacing = bladeLength / (totalItems + 1);
  
  // 渲染叶片上的所有内容项
  const renderItems = () => {
    return config.items.map((item, index) => {
      // 计算该项在叶片上的位置（从中心向外）
      const distance = (index + 1) * itemSpacing;
      
      // 计算该项的位置
      const x = centerX + Math.cos(actualAngle) * distance * appearProgress;
      const y = centerY + Math.sin(actualAngle) * distance * appearProgress;
      
      // 应用 3D 变换
      const pos3D = calculate3DPosition(x, y, centerX, centerY, tiltAngle, rotateY);
      
      // 计算该项的旋转：
      // - 如果 itemRotateWithBlade 为 true，元素随叶片旋转
      // - 如果 itemRotateWithBlade 为 false，元素保持水平
      const itemRotation = itemRotateWithBlade 
        ? 0  // 随叶片旋转，不需要额外旋转
        : -actualAngle * (180 / Math.PI);  // 保持水平，反向旋转
      
      // 计算字体大小（根据透视缩放）
      const adjustedFontSize = config.fontSize * pos3D.scale;
      
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left: pos3D.x,
            top: pos3D.y,
            transform: `translate(-50%, -50%) rotate(${itemRotation}deg) scale(${pos3D.scale})`,
            opacity: pos3D.opacity * appearProgress,
            willChange: "transform, opacity",
          }}
        >
          <ContentItemRenderer
            item={item}
            fontSize={adjustedFontSize}
            color={config.color}
            glowColor={config.glowColor}
            enableGlow={enableGlow}
            glowIntensity={glowIntensity}
            blessingStyle={blessingStyle}
          />
        </div>
      );
    });
  };
  
  return <>{renderItems()}</>;
};

export default WindmillBlade;