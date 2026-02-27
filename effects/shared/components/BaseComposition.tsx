import React, { ReactNode } from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background, Overlay } from "./index";
import { BackgroundType, BaseCompositionProps } from "../schemas";

/**
 * 基础组合组件
 * 
 * 提供统一的背景、遮罩和音效渲染逻辑，减少各特效组件的重复代码。
 * 各特效组合组件可以通过 children 传入特效内容，自动获得公共功能支持。
 * 
 * @example
 * // 基本用法
 * <BaseComposition
 *   backgroundType="color"
 *   backgroundColor="#1a1a2e"
 *   audioEnabled
 * >
 *   <MyEffectContent />
 * </BaseComposition>
 * 
 * // 完整用法
 * <BaseComposition
 *   backgroundType="video"
 *   backgroundSource="bg.mp4"
 *   overlayColor="#000000"
 *   overlayOpacity={0.3}
 *   audioEnabled
 *   audioSource="bgm.mp3"
 *   audioVolume={0.5}
 * >
 *   <MyEffectContent />
 * </BaseComposition>
 * 
 * // 禁用某些层
 * <BaseComposition
 *   showBackground={false}
 *   showOverlay={false}
 * >
 *   <MyEffectContent />
 * </BaseComposition>
 */
export interface BaseCompositionComponentProps extends BaseCompositionProps {
  /** 特效内容（子组件） */
  children: ReactNode;
  
  /** 是否显示背景层，默认 true */
  showBackground?: boolean;
  
  /** 是否显示遮罩层，默认 true */
  showOverlay?: boolean;
  
  /** 遮罩层位置：before（内容前）或 after（内容后），默认 before */
  overlayPosition?: "before" | "after";
  
  /** 额外的层（如 StarField、CenterGlow 等） */
  extraLayers?: ReactNode;
  
  /** 额外层的位置：before-content 或 after-content，默认 before-content */
  extraLayersPosition?: "before-content" | "after-content";
}

export const BaseComposition: React.FC<BaseCompositionComponentProps> = ({
  children,
  showBackground = true,
  showOverlay = true,
  overlayPosition = "before",
  extraLayers,
  extraLayersPosition = "before-content",
  // 背景参数
  backgroundType = "color",
  backgroundSource,
  backgroundColor = "#1a1a2e",
  backgroundGradient,
  backgroundVideoLoop = true,
  backgroundVideoMuted = true,
  // 遮罩参数
  overlayColor = "#000000",
  overlayOpacity = 0.2,
  // 音频参数
  audioEnabled = false,
  audioSource = "coin-sound.mp3",
  audioVolume = 0.5,
  audioLoop = true,
}) => {
  // 渲染遮罩层
  const renderOverlay = () => {
    if (!showOverlay || overlayOpacity <= 0) return null;
    return <Overlay color={overlayColor} opacity={overlayOpacity} />;
  };

  // 渲染额外层
  const renderExtraLayers = () => {
    if (!extraLayers) return null;
    return <>{extraLayers}</>;
  };

  // 渲染音频
  const renderAudio = () => {
    if (!audioEnabled || !audioSource) return null;
    return (
      <Audio
        src={staticFile(audioSource)}
        volume={audioVolume}
        loop={audioLoop}
      />
    );
  };

  return (
    <AbsoluteFill>
      {/* 背景层 */}
      {showBackground && (
        <Background
          type={backgroundType as BackgroundType}
          source={backgroundSource}
          color={backgroundColor}
          gradient={backgroundGradient}
          videoLoop={backgroundVideoLoop}
          videoMuted={backgroundVideoMuted}
        />
      )}

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

      {/* 音频层 */}
      {renderAudio()}
    </AbsoluteFill>
  );
};

export default BaseComposition;
