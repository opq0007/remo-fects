import { z } from "zod";

/**
 * 遮罩效果 Schema（扁平化结构 - 用于 API 参数）
 * 用于在视频上方添加半透明遮罩层
 * 
 * 所有属性都是可选的，组件内部会提供默认值
 */
export const OverlaySchema = z.object({
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
});

export type OverlayProps = z.infer<typeof OverlaySchema>;

/**
 * 嵌套遮罩配置 Schema（用于组件调用）
 * 将遮罩相关参数聚合为嵌套对象
 */
export const NestedOverlaySchema = z.object({
  /** 遮罩颜色 */
  color: z.string().optional(),
  /** 遮罩透明度 */
  opacity: z.number().min(0).max(1).optional(),
});

export type NestedOverlayProps = z.infer<typeof NestedOverlaySchema>;

/**
 * 遮罩组件 Props（用于组件调用）
 */
export interface OverlayComponentProps {
  color?: string;
  opacity?: number;
}

/**
 * 从扁平化 Props 提取嵌套遮罩配置
 */
export function extractOverlayProps(props: OverlayProps): NestedOverlayProps {
  return {
    color: props.overlayColor,
    opacity: props.overlayOpacity,
  };
}