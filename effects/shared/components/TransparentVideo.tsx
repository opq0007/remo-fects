import React, { useRef, useCallback, useMemo } from 'react';
import { AbsoluteFill, useVideoConfig, staticFile, OffthreadVideo, Audio, useCurrentFrame, Sequence } from 'remotion';

// ==================== 类型定义 ====================

/**
 * 透明模式类型
 */
export type TransparencyMode = 'greenScreen' | 'blueScreen' | 'chromaKey' | 'webmAlpha';

/**
 * 色度键配置
 */
export interface ChromaKeyConfig {
  /** 目标颜色（十六进制，如 '#00FF00'），用于 chromaKey 模式 */
  keyColor?: string;
  /** 容差范围（0-255），默认 120 */
  tolerance?: number;
  /** 边缘柔和度（0-1），默认 0.2 */
  softness?: number;
}

/**
 * 透明视频配置
 */
export interface TransparentVideoConfig {
  /** 是否启用 */
  enabled?: boolean;
  /** 视频源（本地路径或网络 URL） */
  src: string;
  /** 自定义音频源（本地路径或网络 URL），优先使用此音频替代视频内置音频 */
  volumeSrc?: string;
  /** 透明模式 */
  mode?: TransparencyMode;
  /** 色度键配置（仅 mode 为 'chromaKey' 时使用） */
  chromaKey?: ChromaKeyConfig;
  /** 视频透明度（0-1），默认 1 */
  opacity?: number;
  /** 缩放比例（0.1-2），默认 1 */
  scale?: number;
  /** 水平位置（0-1，相对于宽度），默认 0.5 */
  x?: number;
  /** 垂直位置（0-1，相对于高度），默认 0.5 */
  y?: number;
  /** 播放速率，默认 1 */
  playbackRate?: number;
  /** 是否循环播放，默认 false */
  loop?: boolean;
  /** 是否静音，默认 false（允许音频播放） */
  muted?: boolean;
  /** 音频音量（0-1），默认 1 */
  volume?: number;
  /** 开始帧（相对于章节开始） */
  startFrame?: number;
  /** 持续帧数（0 表示播放到章节结束） */
  durationInFrames?: number;
  /** 水平翻转 */
  flipX?: boolean;
  /** 垂直翻转 */
  flipY?: boolean;
  /** 旋转角度 */
  rotation?: number;
  /** z-index 层级 */
  zIndex?: number;
}

/**
 * 透明视频组件 Props
 */
export interface TransparentVideoProps extends TransparentVideoConfig {
  /** 视频宽度（可选，默认使用配置宽度 * scale） */
  width?: number;
  /** 视频高度（可选，默认使用配置高度 * scale） */
  height?: number;
}

// ==================== 辅助函数 ====================

/**
 * 解析十六进制颜色为 RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 255, b: 0 }; // 默认绿色
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * 计算颜色距离
 */
const colorDistance = (
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number => {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
};

/**
 * 检测像素是否为绿色（绿幕检测）
 * 参考 Remotion 官方示例的检测方式
 */
const isGreenPixel = (r: number, g: number, b: number): boolean => {
  // 绿色通道应该高
  // 红色和蓝色通道应该相对较低
  return g > 100 && r < 100 && b < 100;
};

/**
 * 检测像素是否为蓝色（蓝幕检测）
 */
const isBluePixel = (r: number, g: number, b: number): boolean => {
  return b > 100 && r < 100 && g < 100;
};

/**
 * 更宽松的绿色检测（用于实际绿幕视频）
 */
const isGreenPixelRelaxed = (r: number, g: number, b: number): boolean => {
  // 绿色应该是主要颜色
  const isGreenDominant = g > r && g > b;
  // 绿色通道足够亮
  const isGreenBright = g > 80;
  // 红色和蓝色相对较低
  const isOtherChannelsLow = r < g * 0.9 && b < g * 0.9;
  
  return isGreenDominant && isGreenBright && isOtherChannelsLow;
};

// ==================== 透明视频组件 ====================

/**
 * 透明视频组件
 * 
 * 支持多种透明模式：
 * - greenScreen: 绿幕抠图（移除绿色背景）
 * - blueScreen: 蓝幕抠图（移除蓝色背景）
 * - chromaKey: 自定义色度键（移除指定颜色）
 * - webmAlpha: WebM 透明视频（无需处理，直接播放）
 * 
 * 音频处理说明：
 * - 视频元素始终静音，避免多实例音频冲突
 * - 使用独立的 Audio 组件播放音频
 * - Audio 组件与视频同步播放，确保音频正确
 */
export const TransparentVideo: React.FC<TransparentVideoProps> = ({
  enabled = true,
  src,
  volumeSrc,
  mode = 'greenScreen',
  chromaKey,
  opacity = 1,
  scale = 1,
  x = 0.5,
  y = 0.5,
  playbackRate = 1,
  loop = false,
  muted = false,
  volume = 1,
  startFrame = 0,
  durationInFrames = 0,
  flipX = false,
  flipY = false,
  rotation = 0,
  zIndex = 20,
  width: customWidth,
  height: customHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: configWidth, height: configHeight, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  
  // 计算视频显示尺寸
  const displayWidth = customWidth ?? Math.round(configWidth * scale);
  const displayHeight = customHeight ?? Math.round(configHeight * scale);
  
  // 判断视频源类型
  const isNetworkUrl = src.startsWith('http://') || src.startsWith('https://');
  const videoSrc = isNetworkUrl ? src : staticFile(src);
  
  // 判断音频源类型，优先使用 volumeSrc
  const audioSource = volumeSrc 
    ? (volumeSrc.startsWith('http://') || volumeSrc.startsWith('https://') ? volumeSrc : staticFile(volumeSrc))
    : videoSrc;
  
  // 是否需要 Canvas 处理（非 webmAlpha 模式需要）
  const needsCanvasProcessing = mode !== 'webmAlpha';
  
  // 获取色度键目标颜色
  const targetColor = useMemo(() => {
    if (mode === 'chromaKey' && chromaKey?.keyColor) {
      return hexToRgb(chromaKey.keyColor);
    }
    return { r: 0, g: 255, b: 0 };
  }, [mode, chromaKey]);
  
  // 色度键参数
  const tolerance = chromaKey?.tolerance ?? 150;
  const softness = chromaKey?.softness ?? 0.3;
  
  // 处理视频帧 - 使用 OffthreadVideo 的 onVideoFrame 回调
  const onVideoFrame = useCallback((frame: CanvasImageSource) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // 确保 Canvas 尺寸正确
    if (canvas.width !== configWidth || canvas.height !== configHeight) {
      canvas.width = configWidth;
      canvas.height = configHeight;
    }
    
    // 绘制帧到 Canvas
    context.drawImage(frame, 0, 0, configWidth, configHeight);
    
    // 获取像素数据
    const imageData = context.getImageData(0, 0, configWidth, configHeight);
    const { data } = imageData;
    
    // 遍历像素，处理透明度
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      let newAlpha = 255;
      
      if (mode === 'greenScreen') {
        // 使用宽松的绿色检测
        if (isGreenPixelRelaxed(r, g, b)) {
          newAlpha = 0;
        }
      } else if (mode === 'blueScreen') {
        if (isBluePixel(r, g, b)) {
          newAlpha = 0;
        }
      } else if (mode === 'chromaKey') {
        const distance = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);
        if (distance < tolerance) {
          // 柔和边缘
          const softnessRange = tolerance * softness;
          if (distance < tolerance - softnessRange) {
            newAlpha = 0;
          } else {
            newAlpha = Math.round(((distance - (tolerance - softnessRange)) / softnessRange) * 255);
          }
        }
      }
      
      // 应用全局 opacity
      data[i + 3] = Math.round(newAlpha * opacity);
    }
    
    // 写回像素数据
    context.putImageData(imageData, 0, 0);
  }, [configWidth, configHeight, mode, targetColor, tolerance, softness, opacity]);
  
  // 计算视频播放起始时间（秒）
  // startFrame 是相对于当前 Sequence 的偏移，需要转换为秒
  const startFrom = useMemo(() => {
    return startFrame / fps;
  }, [startFrame, fps]);
  
  if (!enabled) return null;
  
  // 计算位置和变换
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    transform: `
      translate(-50%, -50%)
      scaleX(${flipX ? -1 : 1})
      scaleY(${flipY ? -1 : 1})
      rotate(${rotation}deg)
    `.trim(),
    zIndex,
  };
  
  // WebM 透明视频模式：直接播放
  // 注意：WebM 模式下仍使用 OffthreadVideo 的原生音频，因为不需要 Canvas 处理
  if (mode === 'webmAlpha') {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={positionStyle}>
          <OffthreadVideo
            src={videoSrc}
            style={{
              width: displayWidth,
              height: displayHeight,
              opacity,
            }}
            playbackRate={playbackRate}
            muted={muted}
            volume={volume}
          />
        </div>
      </AbsoluteFill>
    );
  }
  
  // 色度键模式：使用 Canvas 处理
  // 关键修复：视频元素始终静音，音频使用独立的 Audio 组件
  // 这样可以避免多个 TransparentVideo 实例之间的音频冲突
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* 隐藏的原始视频，用于 Canvas 处理帧，始终静音 */}
      <OffthreadVideo
        src={videoSrc}
        style={{ opacity: 0 }}
        onVideoFrame={onVideoFrame}
        playbackRate={playbackRate}
        muted={true}  // 视频元素始终静音，避免音频冲突
      />
      
      {/* 独立的音频组件，确保音频正确播放 */}
      {/* 只有在 muted=false 时才渲染 Audio 组件 */}
      {/* 优先使用 volumeSrc 指定的音频，否则使用视频内置音频 */}
      {!muted && (
        <Audio
          src={audioSource}
          volume={volume}
          playbackRate={playbackRate}
          startFrom={startFrom}
        />
      )}
      
      {/* 处理后的 Canvas */}
      <div style={positionStyle}>
        <canvas
          ref={canvasRef}
          width={configWidth}
          height={configHeight}
          style={{
            width: displayWidth,
            height: displayHeight,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default TransparentVideo;
