import { z } from "zod";

/**
 * 遮罩效果 Schema
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
 * 遮罩组件 Props（用于组件调用）
 */
export interface OverlayComponentProps {
  color?: string;
  opacity?: number;
}
