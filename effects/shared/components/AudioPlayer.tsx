import React from "react";
import { AbsoluteFill, staticFile, Audio } from "remotion";
import { AudioProps } from "../schemas";

/**
 * 音频播放组件 Props
 */
export interface AudioPlayerProps extends AudioProps {
  /** 音频文件路径（相对于 public 目录） */
  src?: string;
}

/**
 * 音频播放组件
 * 支持启用/禁用、音量控制、循环播放
 * 
 * @example
 * // 使用默认配置
 * <AudioPlayer enabled src="coin-sound.mp3" />
 * 
 * // 自定义音量和循环
 * <AudioPlayer enabled src="bgm.mp3" volume={0.3} loop />
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioEnabled = true,
  audioSource,
  src,
  audioVolume = 0.5,
  audioLoop = true,
}) => {
  // 兼容两种参数名
  const source = audioSource || src;
  
  // 未启用或无音源时不渲染
  if (!audioEnabled || !source) {
    return null;
  }

  return (
    <Audio
      src={staticFile(source)}
      volume={audioVolume}
      loop={audioLoop}
    />
  );
};

export default AudioPlayer;
