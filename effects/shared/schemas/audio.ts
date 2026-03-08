import { z } from "zod";

/**
 * 音频配置 Schema（扁平化结构 - 用于 API 参数）
 * 适用于简单的音频播放场景
 * 
 * 所有属性都是可选的，组件内部会提供默认值
 */
export const AudioSchema = z.object({
  audioEnabled: z.boolean().optional(),
  audioSource: z.string().optional(),
  audioVolume: z.number().min(0).max(1).step(0.01).optional(),
  audioLoop: z.boolean().optional(),
});

export type AudioProps = z.infer<typeof AudioSchema>;

/**
 * 嵌套音频配置 Schema（用于组件调用）
 * 将音频相关参数聚合为嵌套对象
 */
export const NestedAudioSchema = z.object({
  /** 是否启用音频 */
  enabled: z.boolean().optional(),
  /** 音频源文件路径 */
  source: z.string().optional(),
  /** 音量（0-1） */
  volume: z.number().min(0).max(1).optional(),
  /** 是否循环播放 */
  loop: z.boolean().optional(),
});

export type NestedAudioProps = z.infer<typeof NestedAudioSchema>;

/**
 * 从扁平化 Props 提取嵌套音频配置
 */
export function extractAudioProps(props: AudioProps): NestedAudioProps {
  return {
    enabled: props.audioEnabled,
    source: props.audioSource,
    volume: props.audioVolume,
    loop: props.audioLoop,
  };
}
