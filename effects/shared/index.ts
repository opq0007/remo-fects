/**
 * Shared 公共模块
 * 
 * 提供所有特效项目共享的组件、Schema、工具函数和类型定义
 * 
 * @example
 * // 导入公共组件
 * import { Background, Overlay, CenterGlow, StarField } from "../shared/components";
 * 
 * // 导入公共 Schema
 * import { BaseCompositionSchema, BackgroundSchema } from "../shared/schemas";
 * 
 * // 导入工具函数
 * import { seededRandom, easeOutCubic } from "../shared/utils";
 * 
 * // 导入类型
 * import { GlowConfig, ParticleConfig } from "../shared/types";
 */

// 导出 Schema
export * from "./schemas";

// 导出组件
export * from "./components";

// 导出工具函数
export * from "./utils";

// 导出类型
export * from "./types";
