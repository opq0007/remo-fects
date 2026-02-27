import { z } from "zod";

/**
 * 音频配置 Schema（扁平化结构）
 * 适用于简单的音频播放场景
 * 
 * 所有属性都是可选的，组件内部会提供默认值
 */
export const AudioSchema = z.object({
  audioEnabled: z.boolean().optional(),
  audioSource: z.string().optional(),
  audioVolume: z.number().min(0).max(1).optional(),
  audioLoop: z.boolean().optional(),
});

export type AudioProps = z.infer<typeof AudioSchema>;

/**
 * 嵌套音频配置 Schema（嵌套结构）
 * 适用于需要将音频配置单独分组的场景
 * 
 * 注意：属性名称使用简短形式（src, volume 等）以兼容现有代码
 */
export const NestedAudioSchema = z.object({
  enabled: z.boolean().optional(),
  src: z.string().optional(),
  source: z.string().optional(),
  volume: z.number().min(0).max(1).optional(),
  loop: z.boolean().optional(),
});

export type NestedAudioProps = z.infer<typeof NestedAudioSchema>;