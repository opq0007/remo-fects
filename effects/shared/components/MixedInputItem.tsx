/**
 * 混合输入渲染组件
 * 
 * 提供统一的文字、图片、祝福图案渲染组件，供各特效项目复用
 */

import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { SingleBlessingSymbol } from "./BlessingSymbol";
import { generateTextStyle } from "../utils/textStyle";
import {
  MixedInputItem,
  MixedTextStyleConfig,
  MixedImageStyleConfig,
  BlessingStyleConfig,
} from "../types/mixed-input";
import { BlessingSymbolType } from "../schemas";

// ==================== 组件 Props 定义 ====================

/**
 * 文字项目渲染 Props
 */
export interface TextItemRenderProps {
  /** 项目数据 */
  item: MixedInputItem;
  /** 文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 额外的容器样式 */
  containerStyle?: React.CSSProperties;
  /** 是否启用动画 */
  enableAnimation?: boolean;
}

/**
 * 图片项目渲染 Props
 */
export interface ImageItemRenderProps {
  /** 项目数据 */
  item: MixedInputItem;
  /** 图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 额外的容器样式 */
  containerStyle?: React.CSSProperties;
  /** 是否启用动画 */
  enableAnimation?: boolean;
}

/**
 * 祝福图案项目渲染 Props
 */
export interface BlessingItemRenderProps {
  /** 项目数据 */
  item: MixedInputItem;
  /** 额外的容器样式 */
  containerStyle?: React.CSSProperties;
  /** 是否启用动画 */
  enableAnimation?: boolean;
}

/**
 * 通用混合输入项目渲染 Props
 */
export interface MixedInputItemRenderProps {
  /** 项目数据 */
  item: MixedInputItem;
  /** 文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 额外的容器样式 */
  containerStyle?: React.CSSProperties;
  /** 是否启用动画 */
  enableAnimation?: boolean;
  /** 自定义动画进度（0-1） */
  animationProgress?: number;
}

// ==================== 样式生成函数 ====================

/**
 * 生成图片样式
 */
const generateImageStyle = (
  item: MixedInputItem,
  style: MixedImageStyleConfig,
  frame: number
): React.CSSProperties => {
  const styles: React.CSSProperties = {
    width: item.width,
    height: item.height,
    objectFit: "contain",
  };

  const filters: string[] = [];

  // 发光效果
  if (style.glow) {
    const glowColor = style.glowColor ?? "#ffd700";
    const glowIntensity = style.glowIntensity ?? 0.8;
    filters.push(`drop-shadow(0 0 ${((item.width ?? 50) * 0.15 * glowIntensity)}px ${glowColor})`);
  }

  // 阴影效果
  if (style.shadow) {
    const shadowColor = style.shadowColor ?? "rgba(0,0,0,0.5)";
    const shadowBlur = style.shadowBlur ?? 20;
    filters.push(`drop-shadow(5px 5px ${shadowBlur}px ${shadowColor})`);
  }

  if (filters.length > 0) {
    styles.filter = filters.join(" ");
  }

  return styles;
};

/**
 * 计算动态变换
 */
const calculateDynamicTransform = (
  item: MixedInputItem,
  style: MixedImageStyleConfig,
  frame: number,
  baseRotation: number
): { rotation: number; x: number } => {
  let dynamicRotation = baseRotation;
  let dynamicX = 0;

  // 摇摆效果
  if (style.swing && item.swingPhase !== undefined) {
    const swingAngle = style.swingAngle ?? 15;
    const swingSpeed = style.swingSpeed ?? 2;
    dynamicRotation += Math.sin(frame * 0.1 * swingSpeed + item.swingPhase) * swingAngle;
  }

  // 旋转效果
  if (style.spin && item.spinDirection !== undefined) {
    const spinSpeed = style.spinSpeed ?? 1;
    dynamicRotation += frame * (360 * spinSpeed / 30) * item.spinDirection;
  }

  return { rotation: dynamicRotation, x: dynamicX };
};

// ==================== 单类型渲染组件 ====================

/**
 * 文字项目渲染组件
 */
export const TextItemRender: React.FC<TextItemRenderProps> = ({
  item,
  textStyle = {},
  containerStyle = {},
  enableAnimation = true,
}) => {
  const frame = useCurrentFrame();
  const fontSize = item.fontSize ?? item.width ?? 48;

  // 合并文字样式
  const mergedTextStyle: MixedTextStyleConfig = {
    color: "#ffd700",
    effect: "gold3d",
    effectIntensity: 0.8,
    fontWeight: 700,
    ...textStyle,
  };

  const textStyles = generateTextStyle(fontSize, mergedTextStyle);

  // 计算动态旋转
  let rotation = item.rotation ?? 0;
  if (enableAnimation && item.blessingStyle?.animated) {
    rotation += frame * 0.5 * (item.blessingStyle.animationSpeed ?? 1);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${item.scale ?? 1})`,
        opacity: item.opacity,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        ...containerStyle,
        ...textStyles,
      }}
    >
      {item.content}
    </div>
  );
};

/**
 * 图片项目渲染组件
 */
export const ImageItemRender: React.FC<ImageItemRenderProps> = ({
  item,
  imageStyle = {},
  containerStyle = {},
  enableAnimation = true,
}) => {
  const frame = useCurrentFrame();

  // 合并图片样式
  const mergedImageStyle: MixedImageStyleConfig = {
    glow: true,
    glowColor: "#ffd700",
    glowIntensity: 0.6,
    shadow: true,
    shadowBlur: 15,
    swing: true,
    swingAngle: 10,
    swingSpeed: 2,
    ...imageStyle,
  };

  const imgStyles = generateImageStyle(item, mergedImageStyle, frame);
  const { rotation } = calculateDynamicTransform(
    item,
    enableAnimation ? mergedImageStyle : {},
    frame,
    item.rotation ?? 0
  );

  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${item.scale ?? 1})`,
        opacity: item.opacity,
        pointerEvents: "none",
        ...containerStyle,
      }}
    >
      <Img src={staticFile(item.content)} style={imgStyles} />
    </div>
  );
};

/**
 * 祝福图案项目渲染组件
 */
export const BlessingItemRender: React.FC<BlessingItemRenderProps> = ({
  item,
  containerStyle = {},
  enableAnimation = true,
}) => {
  const frame = useCurrentFrame();
  const size = item.width ?? 60;

  // 获取祝福图案样式
  const blessingStyle: BlessingStyleConfig = {
    primaryColor: "#FFD700",
    secondaryColor: "#FFA500",
    enable3D: true,
    enableGlow: true,
    glowIntensity: 1,
    ...item.blessingStyle,
  };

  // 计算动态旋转
  let rotation = item.rotation ?? 0;
  if (enableAnimation && blessingStyle.animated) {
    rotation += frame * 0.5 * (blessingStyle.animationSpeed ?? 1);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${item.scale ?? 1})`,
        opacity: item.opacity,
        pointerEvents: "none",
        width: size,
        height: size,
        ...containerStyle,
      }}
    >
      <SingleBlessingSymbol
        type={item.content as BlessingSymbolType}
        size={size}
        primaryColor={blessingStyle.primaryColor}
        secondaryColor={blessingStyle.secondaryColor}
        enable3D={blessingStyle.enable3D}
        enableGlow={blessingStyle.enableGlow}
        glowIntensity={blessingStyle.glowIntensity ?? 1}
      />
    </div>
  );
};

// ==================== 通用渲染组件 ====================

/**
 * 混合输入项目渲染组件
 * 
 * 根据项目类型自动选择对应的渲染组件
 * 
 * @example
 * // 基础用法
 * <MixedInputItemRender
 *   item={{ type: "text", content: "福", x: 100, y: 200, fontSize: 48 }}
 *   textStyle={{ color: "#FFD700", effect: "gold3d" }}
 * />
 * 
 * // 图片项目
 * <MixedInputItemRender
 *   item={{ type: "image", content: "coin.png", x: 150, y: 300, width: 80 }}
 *   imageStyle={{ glow: true, swing: true }}
 * />
 * 
 * // 祝福图案项目
 * <MixedInputItemRender
 *   item={{ type: "blessing", content: "goldCoin", x: 200, y: 400, width: 60 }}
 * />
 */
export const MixedInputItemRender: React.FC<MixedInputItemRenderProps> = ({
  item,
  textStyle,
  imageStyle,
  containerStyle,
  enableAnimation = true,
}) => {
  switch (item.type) {
    case "text":
      return (
        <TextItemRender
          item={item}
          textStyle={textStyle}
          containerStyle={containerStyle}
          enableAnimation={enableAnimation}
        />
      );
    case "image":
      return (
        <ImageItemRender
          item={item}
          imageStyle={imageStyle}
          containerStyle={containerStyle}
          enableAnimation={enableAnimation}
        />
      );
    case "blessing":
      return (
        <BlessingItemRender
          item={item}
          containerStyle={containerStyle}
          enableAnimation={enableAnimation}
        />
      );
    default:
      return null;
  }
};

// ==================== 批量渲染组件 ====================

/**
 * 混合输入列表渲染 Props
 */
export interface MixedInputListRenderProps {
  /** 项目列表 */
  items: MixedInputItem[];
  /** 文字样式 */
  textStyle?: MixedTextStyleConfig;
  /** 图片样式 */
  imageStyle?: MixedImageStyleConfig;
  /** 额外的容器样式 */
  containerStyle?: React.CSSProperties;
  /** 是否启用动画 */
  enableAnimation?: boolean;
  /** 自定义过滤函数 */
  filter?: (item: MixedInputItem, index: number) => boolean;
}

/**
 * 混合输入列表渲染组件
 * 
 * 批量渲染混合输入项目列表
 * 
 * @example
 * <MixedInputListRender
 *   items={mixedItems}
 *   textStyle={{ color: "#FFD700" }}
 *   imageStyle={{ glow: true }}
 * />
 */
export const MixedInputListRender: React.FC<MixedInputListRenderProps> = ({
  items,
  textStyle,
  imageStyle,
  containerStyle,
  enableAnimation = true,
  filter,
}) => {
  const filteredItems = filter ? items.filter(filter) : items;

  return (
    <>
      {filteredItems.map((item) => (
        <MixedInputItemRender
          key={item.id}
          item={item}
          textStyle={textStyle}
          imageStyle={imageStyle}
          containerStyle={containerStyle}
          enableAnimation={enableAnimation}
        />
      ))}
    </>
  );
};

// ==================== 类型判断工具 ====================

/**
 * 判断是否为文字项目
 */
export function isTextItem(item: MixedInputItem): item is MixedInputItem & { type: "text" } {
  return item.type === "text";
}

/**
 * 判断是否为图片项目
 */
export function isImageItem(item: MixedInputItem): item is MixedInputItem & { type: "image" } {
  return item.type === "image";
}

/**
 * 判断是否为祝福图案项目
 */
export function isBlessingItem(item: MixedInputItem): item is MixedInputItem & { type: "blessing" } {
  return item.type === "blessing";
}
