import React, { ReactNode } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background, Overlay, Watermark, Marquee, RadialBurst, Foreground } from "./index";
import { 
  BackgroundType, 
  NestedBackgroundProps,
  NestedOverlayProps,
  NestedAudioProps,
  RadialBurstComponentProps, 
  ForegroundComponentProps 
} from "../schemas";
import { Watermark as WatermarkComponent, WatermarkProps } from "./Watermark";
import { Marquee as MarqueeComponent, MarqueeProps } from "./Marquee";

// ==================== 嵌套配置类型定义 ====================

/**
 * 水印配置（用于 BaseComposition）
 * 从 WatermarkProps 中排除 text 必填限制，允许为空
 */
type WatermarkConfig = Partial<WatermarkProps> & {
  enabled?: boolean;
};

/**
 * 走马灯配置（用于 BaseComposition）
 */
type MarqueeConfig = Partial<MarqueeProps> & {
  enabled?: boolean;
};

// ==================== 组件 Props 定义 ====================

/**
 * 基础组合组件 Props（嵌套参数结构）
 * 
 * 使用嵌套对象组织各子组件的参数，提高可读性和可维护性：
 * - background: 背景配置
 * - overlay: 遮罩配置
 * - audio: 音频配置
 * - watermark: 水印配置
 * - marquee: 走马灯配置
 * - radialBurst: 发散粒子配置
 * - foreground: 前景配置
 */
export interface BaseCompositionComponentProps {
  /** 特效内容（子组件） */
  children: ReactNode;
  
  // ===== 嵌套参数配置 =====
  
  /**
   * 背景配置对象
   * @example
   * background={{
   *   type: 'gradient',
   *   gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
   * }}
   */
  background?: NestedBackgroundProps;
  
  /** 是否显示背景层，默认 true */
  showBackground?: boolean;
  
  /**
   * 遮罩配置对象
   * @example
   * overlay={{
   *   color: '#000000',
   *   opacity: 0.3
   * }}
   */
  overlay?: NestedOverlayProps;
  
  /** 是否显示遮罩层，默认 true */
  showOverlay?: boolean;
  
  /** 遮罩层位置：before（内容前）或 after（内容后），默认 before */
  overlayPosition?: "before" | "after";
  
  /**
   * 音频配置对象
   * @example
   * audio={{
   *   enabled: true,
   *   source: 'bgm.mp3',
   *   volume: 0.5,
   *   loop: true
   * }}
   */
  audio?: NestedAudioProps;
  
  /**
   * 水印配置对象
   * @example
   * watermark={{
   *   enabled: true,
   *   text: "© 2026 MyBrand",
   *   effect: "bounce",
   * }}
   */
  watermark?: WatermarkConfig;
  
  /**
   * 走马灯配置对象
   * @example
   * marquee={{
   *   enabled: true,
   *   foregroundTexts: ['生日快乐', '幸福安康'],
   *   speed: 50
   * }}
   */
  marquee?: MarqueeConfig;
  
  /**
   * 发散粒子效果配置对象
   * @example
   * radialBurst={{
   *   enabled: true,
   *   effectType: 'sparkleBurst',
   *   color: '#FFD76A'
   * }}
   */
  radialBurst?: RadialBurstComponentProps;
  
  /**
   * 前景配置对象
   * @example
   * foreground={{
   *   enabled: true,
   *   type: 'image',
   *   source: 'overlay.png',
   *   opacity: 0.8
   * }}
   */
  foreground?: ForegroundComponentProps;
  
  // ===== 其他配置 =====
  
  /** 额外的层（如 StarField、CenterGlow 等） */
  extraLayers?: ReactNode;
  
  /** 额外层的位置：before-content 或 after-content，默认 before-content */
  extraLayersPosition?: "before-content" | "after-content";
}

/**
 * 基础组合组件
 * 
 * 提供统一的背景、遮罩、音效和水印渲染逻辑，减少各特效组件的重复代码。
 * 各特效组合组件可以通过 children 传入特效内容，自动获得公共功能支持。
 * 
 * @example
 * <BaseComposition
 *   background={{
 *     type: 'gradient',
 *     gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
 *   }}
 *   overlay={{
 *     color: '#000000',
 *     opacity: 0.3
 *   }}
 *   audio={{
 *     enabled: true,
 *     source: 'bgm.mp3',
 *     volume: 0.5
 *   }}
 *   watermark={{
 *     enabled: true,
 *     text: "© 2026 MyBrand",
 *     effect: "bounce",
 *   }}
 * >
 *   <MyEffectContent />
 * </BaseComposition>
 */
export const BaseComposition: React.FC<BaseCompositionComponentProps> = ({
  children,
  showBackground = true,
  showOverlay = true,
  overlayPosition = "before",
  extraLayers,
  extraLayersPosition = "before-content",
  // 嵌套参数
  background,
  overlay,
  audio,
  watermark,
  marquee,
  radialBurst,
  foreground,
}) => {
  // ===== 提取参数（带默认值） =====
  
  // 背景参数
  const bgType = background?.type ?? "color";
  const bgSource = background?.source;
  const bgColor = background?.color ?? "#1a1a2e";
  const bgGradient = background?.gradient;
  const bgVideoLoop = background?.videoLoop ?? true;
  const bgVideoMuted = background?.videoMuted ?? true;
  
  // 遮罩参数
  const ovColor = overlay?.color ?? "#000000";
  const ovOpacity = overlay?.opacity ?? 0.2;
  
  // 音频参数
  const audEnabled = audio?.enabled ?? false;
  const audSource = audio?.source ?? "coin-sound.mp3";
  const audVolume = audio?.volume ?? 0.5;
  const audLoop = audio?.loop ?? true;

  // 渲染遮罩层
  const renderOverlay = () => {
    if (!showOverlay || ovOpacity <= 0) return null;
    return <Overlay color={ovColor} opacity={ovOpacity} />;
  };

  // 渲染额外层
  const renderExtraLayers = () => {
    if (!extraLayers) return null;
    return <>{extraLayers}</>;
  };

  // 渲染音频
  const renderAudio = () => {
    if (!audEnabled || !audSource) return null;
    return (
      <Audio
        src={staticFile(audSource)}
        volume={audVolume}
        loop={audLoop}
      />
    );
  };

  // 渲染水印
  const renderWatermark = () => {
    if (!watermark || !watermark.enabled || !watermark.text) return null;
    return <WatermarkComponent {...watermark} text={watermark.text} />;
  };

  // 渲染走马灯
  const renderMarquee = () => {
    if (!marquee || !marquee.enabled) return null;
    return <MarqueeComponent {...marquee} />;
  };

  // 渲染发散粒子效果
  const renderRadialBurst = () => {
    if (!radialBurst || !radialBurst.enabled) return null;
    
    return (
      <RadialBurst
        enabled={radialBurst.enabled}
        effectType={radialBurst.effectType}
        color={radialBurst.color}
        secondaryColor={radialBurst.secondaryColor}
        intensity={radialBurst.intensity}
        verticalOffset={radialBurst.verticalOffset}
        count={radialBurst.count}
        speed={radialBurst.speed}
        opacity={radialBurst.opacity}
        seed={radialBurst.seed}
        rotate={radialBurst.rotate}
        rotationSpeed={radialBurst.rotationSpeed}
      />
    );
  };

  // 渲染前景层
  const renderForeground = () => {
    if (!foreground || !foreground.enabled || !foreground.source) return null;
    
    return (
      <Foreground
        type={foreground.type}
        source={foreground.source}
        width={foreground.width}
        height={foreground.height}
        verticalOffset={foreground.verticalOffset}
        horizontalOffset={foreground.horizontalOffset}
        scale={foreground.scale}
        animationType={foreground.animationType}
        animationStartFrame={foreground.animationStartFrame}
        animationDuration={foreground.animationDuration}
        animationIntensity={foreground.animationIntensity}
        useSpring={foreground.useSpring}
        springDamping={foreground.springDamping}
        springStiffness={foreground.springStiffness}
        opacity={foreground.opacity}
        mixBlendMode={foreground.mixBlendMode}
        objectFit={foreground.objectFit}
        enabled={foreground.enabled}
        zIndex={foreground.zIndex}
        videoLoop={foreground.videoLoop}
        videoMuted={foreground.videoMuted}
        continuousAnimation={foreground.continuousAnimation}
        continuousSpeed={foreground.continuousSpeed}
      />
    );
  };

  return (
    <AbsoluteFill>
      {/* 背景层 */}
      {showBackground && (
        <Background
          type={bgType as BackgroundType}
          source={bgSource}
          color={bgColor}
          gradient={bgGradient}
          videoLoop={bgVideoLoop}
          videoMuted={bgVideoMuted}
        />
      )}

      {/* 发散粒子效果层 - 在背景之后、内容之前 */}
      {renderRadialBurst()}

      {/* 额外层（内容前） */}
      {extraLayersPosition === "before-content" && renderExtraLayers()}

      {/* 遮罩层（内容前） */}
      {overlayPosition === "before" && renderOverlay()}

      {/* 特效内容 */}
      {children}

      {/* 遮罩层（内容后） */}
      {overlayPosition === "after" && renderOverlay()}

      {/* 额外层（内容后） */}
      {extraLayersPosition === "after-content" && renderExtraLayers()}

      {/* 前景层 - 在水印层之前 */}
      {renderForeground()}

      {/* 水印层 */}
      {renderWatermark()}

      {/* 走马灯层 */}
      {renderMarquee()}

      {/* 音频层 */}
      {renderAudio()}
    </AbsoluteFill>
  );
};

export default BaseComposition;
