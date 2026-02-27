/**
 * 公共类型定义
 */

/**
 * 位置配置（相对坐标，-0.5 到 0.5）
 */
export interface RelativePosition {
  /** 水平位置（-0.5 左 到 0.5 右） */
  x: number;
  /** 垂直位置（-0.5 上 到 0.5 下） */
  y: number;
}

/**
 * 尺寸配置
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 颜色配置（支持纯色和渐变）
 */
export interface ColorConfig {
  type: "solid" | "gradient";
  value: string;
  gradientAngle?: number;
}

/**
 * 文字样式基础配置
 */
export interface BaseTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
}

/**
 * 发光效果配置
 */
export interface GlowConfig {
  color: string;
  intensity: number;
  blur?: number;
}

/**
 * 阴影效果配置
 */
export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

/**
 * 动画时长配置（帧数）
 */
export interface AnimationTiming {
  /** 入场动画时长 */
  entrance?: number;
  /** 停留时长 */
  hold?: number;
  /** 退场动画时长 */
  exit?: number;
}

/**
 * 3D 透视配置
 */
export interface Perspective3D {
  /** 视角角度（度数：0=水平视角，90=正上方俯视） */
  viewAngle?: number;
  /** 透视距离（像素） */
  perspectiveDistance?: number;
  /** 是否启用 3D 效果 */
  enabled?: boolean;
}

/**
 * 粒子配置
 */
export interface ParticleConfig {
  /** 粒子数量 */
  count: number;
  /** 粒子大小范围 */
  sizeRange?: [number, number];
  /** 粒子速度 */
  speed?: number;
  /** 重力系数 */
  gravity?: number;
  /** 风力系数 */
  wind?: number;
}
