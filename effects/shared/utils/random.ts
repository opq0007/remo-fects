/**
 * 随机数工具函数
 */

/**
 * 基于字符串种子的确定性随机数生成器
 * 相同的种子字符串总是返回相同的随机数 (0-1)
 * 
 * @param seed 种子字符串
 * @returns 0 到 1 之间的确定性随机数
 * 
 * @example
 * seededRandom("hello") // 始终返回相同的值，例如 0.723
 * seededRandom("world") // 始终返回相同的值，例如 0.156
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

/**
 * 基于数字种子的确定性随机数生成器
 * 使用线性同余生成器算法
 * 
 * @param seed 数字种子
 * @returns 0 到 1 之间的确定性随机数
 * 
 * @example
 * seededRandomNumber(42) // 始终返回相同的值
 * seededRandomNumber(100) // 始终返回相同的值
 */
export function seededRandomNumber(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * 创建一个带状态的随机数生成器
 * 每次调用返回下一个随机数，内部状态递增
 * 
 * @param seed 初始种子
 * @returns 返回一个函数，每次调用返回下一个随机数
 * 
 * @example
 * const random = createSeededRandom(42);
 * random() // 0.xxx
 * random() // 0.yyy (不同的值)
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * 在指定范围内生成随机整数（基于字符串种子）
 * 
 * @param seed 种子字符串
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 范围内的随机整数
 */
export function seededRandomInt(seed: string, min: number, max: number): number {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

/**
 * 在指定范围内生成随机浮点数（基于字符串种子）
 * 
 * @param seed 种子字符串
 * @param min 最小值
 * @param max 最大值
 * @returns 范围内的随机浮点数
 */
export function seededRandomFloat(seed: string, min: number, max: number): number {
  return seededRandom(seed) * (max - min) + min;
}

/**
 * 从数组中随机选择一个元素（基于字符串种子）
 * 
 * @param seed 种子字符串
 * @param array 数组
 * @returns 随机选择的元素
 */
export function seededRandomChoice<T>(seed: string, array: T[]): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}
