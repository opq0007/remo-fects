import React, { useMemo } from "react";
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
} from "remotion";
import { WindmillBlade, BladeContentType } from "./WindmillBlade";
import { seededRandom } from "../../shared/index";

/**
 * 叶片数据类型（二维数组）
 * 第一维：每个叶片
 * 第二维：叶片内的内容项（垂直拼接）
 */
export type BladesData = Array<Array<{ type: BladeContentType; content: string }>>;

/**
 * 大风车 Props
 */
export interface WindmillProps {
  /** 叶片数据（二维数组） */
  bladesData: BladesData;
  /** 颜色列表 */
  colors: string[];
  /** 发光颜色 */
  glowColor: string;
  /** 基础字体大小 */
  fontSize: number;
  /** 旋转速度（圈/秒） */
  rotationSpeed: number;
  /** 旋转方向：clockwise（顺时针）或 counterclockwise（逆时针） */
  rotationDirection: "clockwise" | "counterclockwise";
  /** 中心点垂直偏移（-0.5 到 0.5，相对于画面高度） */
  centerOffsetY: number;
  /** 3D 视角倾斜角度（度） */
  tiltAngle: number;
  /** 3D 视角 Y 轴旋转角度（度） */
  rotateY: number;
  /** 透视距离 */
  perspective: number;
  /** 是否启用发光 */
  enableGlow: boolean;
  /** 发光强度 */
  glowIntensity: number;
  /** 叶片出现动画时长（帧） */
  appearDuration: number;
  /** 叶片内部元素是否随叶片旋转（true: 随叶片旋转, false: 保持水平） */
  itemRotateWithBlade: boolean;
  /** 叶片长度比例（0.3-1.0），默认 0.7 */
  bladeLengthRatio: number;
  /** 是否启用叶片长度随机变化 */
  enableRandomBladeLength: boolean;
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
 * 大风车主组件
 */
export const Windmill: React.FC<WindmillProps> = ({
  bladesData,
  colors,
  glowColor,
  fontSize,
  rotationSpeed,
  rotationDirection,
  centerOffsetY,
  tiltAngle,
  rotateY,
  perspective,
  enableGlow,
  glowIntensity,
  appearDuration,
  itemRotateWithBlade,
  bladeLengthRatio,
  enableRandomBladeLength,
  blessingStyle,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // 计算中心点位置（带垂直偏移）
  const centerX = width / 2;
  const centerY = height / 2 + height * centerOffsetY;
  
  // 计算当前旋转角度
  const direction = rotationDirection === "clockwise" ? 1 : -1;
  const currentRotation = interpolate(
    frame,
    [0, 24 / rotationSpeed],
    [0, Math.PI * 2 * direction],
    { extrapolateRight: "extend" as const }
  );
  
  // 生成叶片配置
  const bladeConfigs = useMemo(() => {
    return bladesData.map((items, index) => {
      // 叶片的基础角度（均匀分布）
      const angleStep = (Math.PI * 2) / bladesData.length;
      const baseAngle = index * angleStep - Math.PI / 2; // 从顶部开始
      
      // 叶片颜色
      const color = colors[index % colors.length];
      
      // 叶片长度比例
      let lengthRatio = bladeLengthRatio;
      if (enableRandomBladeLength) {
        // 启用随机长度时，使用随机值
        const randomLength = seededRandom(`windmill-blade-length-${index}`);
        lengthRatio = bladeLengthRatio * (0.85 + randomLength * 0.3);
      }
      
      // 出现延迟（依次出现）
      const appearDelay = index * (appearDuration / bladesData.length) * 0.5;
      
      return {
        index,
        items,
        color,
        glowColor,
        fontSize,
        lengthRatio,
        appearDelay,
        baseAngle,
      };
    });
  }, [bladesData, colors, glowColor, fontSize, appearDuration, bladeLengthRatio, enableRandomBladeLength]);
  
  return (
    <AbsoluteFill style={{ perspective: `${perspective}px` }}>
      {/* 风车主体 */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 中心轴装饰 */}
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%)`,
            width: fontSize * 1.5,
            height: fontSize * 1.5,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            boxShadow: enableGlow
              ? `0 0 ${20 * glowIntensity}px ${glowColor}, 0 0 ${40 * glowIntensity}px ${glowColor}`
              : "none",
            opacity: 0.8,
          }}
        />
        
        {/* 叶片 */}
        {bladeConfigs.map((config) => (
          <WindmillBlade
            key={config.index}
            config={config}
            baseAngle={config.baseAngle}
            centerX={centerX}
            centerY={centerY}
            currentRotation={currentRotation}
            enableGlow={enableGlow}
            glowIntensity={glowIntensity}
            tiltAngle={tiltAngle}
            rotateY={rotateY}
            perspective={perspective}
            itemRotateWithBlade={itemRotateWithBlade}
            blessingStyle={blessingStyle}
          />
        ))}
        
        {/* 中心点装饰 */}
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%)`,
            width: fontSize * 0.8,
            height: fontSize * 0.8,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors[0]} 0%, ${glowColor} 100%)`,
            boxShadow: enableGlow
              ? `0 0 ${15 * glowIntensity}px ${glowColor}, inset 0 0 ${10 * glowIntensity}px rgba(255,255,255,0.5)`
              : "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default Windmill;
