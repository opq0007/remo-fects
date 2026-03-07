/**
 * 章节配置合并工具
 * 
 * 用于合并预设章节配置和自定义章节配置
 * 支持部分覆盖：自定义配置只覆盖指定字段，未定义字段保留默认值
 */

import { StoryChapterConfig } from '../../../effects/shared/components/StoryPanel';
import { CustomChapterInputProps } from '../../../effects/shared/schemas';

/**
 * 深度合并两个对象
 * 
 * 规则：
 * - 对于基本类型，自定义值覆盖默认值
 * - 对于对象类型，递归合并
 * - 对于数组类型，自定义数组完全覆盖默认数组
 * - undefined 值不会覆盖默认值
 */
function deepMerge<T>(defaultConfig: T, customConfig: Partial<T> | undefined): T {
  if (!customConfig) return defaultConfig;
  
  const result = { ...defaultConfig } as T;
  
  for (const key of Object.keys(customConfig) as (keyof T)[]) {
    const customValue = customConfig[key];
    const defaultValue = defaultConfig[key];
    
    // 跳过 undefined 值
    if (customValue === undefined) continue;
    
    // 数组类型：完全覆盖
    if (Array.isArray(customValue)) {
      result[key] = customValue as T[keyof T];
    }
    // 对象类型：递归合并
    else if (
      customValue !== null &&
      typeof customValue === 'object' &&
      defaultValue !== null &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      result[key] = deepMerge(defaultValue as object, customValue as Record<string, unknown>) as T[keyof T];
    }
    // 基本类型：直接覆盖
    else {
      result[key] = customValue as T[keyof T];
    }
  }
  
  return result;
}

/**
 * 合并预设章节列表和自定义章节列表
 * 
 * 合并规则：
 * 1. 按 id 匹配章节
 * 2. 如果自定义章节不存在于预设章节中，追加到列表末尾（需要提供 durationInFrames）
 * 3. 如果自定义章节只定义了部分字段，未定义字段使用预设值
 * 4. 如果自定义章节没有 id，跳过并警告
 * 
 * @param defaultChapters 预设章节列表
 * @param customChapters 自定义章节列表
 * @returns 合并后的章节列表
 * 
 * @example
 * ```typescript
 * const defaultChapters = [
 *   { id: 'A', durationInFrames: 48, backgroundColor: '#0a0a20' },
 *   { id: 'B', durationInFrames: 240, backgroundColor: '#1a1a2e' },
 * ];
 * 
 * const customChapters = [
 *   { id: 'A', backgroundColor: '#ff0000' },  // 只覆盖背景色，durationInFrames 自动继承
 *   { id: 'C', durationInFrames: 100 },       // 新增章节（需要 durationInFrames）
 * ];
 * 
 * const merged = mergeChapterConfigs(defaultChapters, customChapters);
 * // 结果：
 * // [
 * //   { id: 'A', durationInFrames: 48, backgroundColor: '#ff0000' },
 * //   { id: 'B', durationInFrames: 240, backgroundColor: '#1a1a2e' },
 * //   { id: 'C', durationInFrames: 100 },
 * // ]
 * ```
 */
export function mergeChapterConfigs(
  defaultChapters: StoryChapterConfig[],
  customChapters: unknown[] | undefined
): StoryChapterConfig[] {
  if (!customChapters || customChapters.length === 0) {
    return defaultChapters;
  }
  
  // 类型断言
  const typedCustomChapters = customChapters as CustomChapterInputProps[];
  
  // 创建预设章节的 Map，用于快速查找
  const defaultMap = new Map<string, StoryChapterConfig>();
  for (const chapter of defaultChapters) {
    if (chapter.id) {
      defaultMap.set(chapter.id, chapter);
    }
  }
  
  // 结果列表：存储合并后的章节
  const mergedMap = new Map<string, StoryChapterConfig>();
  const newChapters: StoryChapterConfig[] = [];
  
  // 处理自定义章节
  for (const customChapter of typedCustomChapters) {
    // 跳过没有 id 的章节
    if (!customChapter.id) {
      console.warn('mergeChapterConfigs: 自定义章节缺少 id，已跳过');
      continue;
    }
    
    const defaultChapter = defaultMap.get(customChapter.id);
    
    if (defaultChapter) {
      // 存在预设章节，合并配置
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const merged = deepMerge(defaultChapter, customChapter as any);
      mergedMap.set(customChapter.id, merged);
    } else {
      // 不存在预设章节，检查是否有所需字段
      if (!customChapter.durationInFrames) {
        console.warn(`mergeChapterConfigs: 新增章节 "${customChapter.id}" 缺少 durationInFrames，已跳过`);
        continue;
      }
      // 新增章节
      newChapters.push(customChapter as StoryChapterConfig);
    }
  }
  
  // 构建最终结果：保持预设章节的顺序
  const finalResult: StoryChapterConfig[] = [];
  
  for (const defaultChapter of defaultChapters) {
    if (defaultChapter.id && mergedMap.has(defaultChapter.id)) {
      // 使用合并后的章节
      finalResult.push(mergedMap.get(defaultChapter.id)!);
    } else {
      // 使用预设章节
      finalResult.push(defaultChapter);
    }
  }
  
  // 添加新增的自定义章节
  finalResult.push(...newChapters);
  
  return finalResult;
}

/**
 * 章节配置差异分析
 * 
 * 用于调试和分析自定义配置覆盖了哪些预设值
 */
export function diffChapterConfigs(
  defaultChapter: StoryChapterConfig,
  customChapter: Partial<StoryChapterConfig>
): {
  added: string[];
  modified: string[];
  removed: string[];
} {
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];
  
  for (const key of Object.keys(customChapter) as (keyof StoryChapterConfig)[]) {
    if (!(key in defaultChapter)) {
      added.push(key);
    } else if (customChapter[key] !== defaultChapter[key]) {
      modified.push(key);
    }
  }
  
  return { added, modified, removed };
}
