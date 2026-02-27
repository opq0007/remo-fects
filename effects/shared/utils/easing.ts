/**
 * 缓动函数工具集
 * 用于创建各种动画过渡效果
 */

/**
 * 线性插值（无缓动）
 */
export function linear(t: number): number {
  return t;
}

/**
 * 缓入（开始慢，结束快）
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * 缓出（开始快，结束慢）
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * 缓入缓出
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * 三次方缓入
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * 三次方缓出
 */
export function easeOutCubic(t: number): number {
  return (--t) * t * t + 1;
}

/**
 * 三次方缓入缓出
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * 弹性缓出
 */
export function easeOutElastic(t: number): number {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

/**
 * 弹跳缓出
 */
export function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
}

/**
 * 指数缓入
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

/**
 * 指数缓出
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * 正弦缓入
 */
export function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * 正弦缓出
 */
export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

/**
 * 正弦缓入缓出
 */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number;

/**
 * 缓动函数映射表
 */
export const easingFunctions: Record<string, EasingFunction> = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutElastic,
  easeOutBounce,
  easeInExpo,
  easeOutExpo,
  easeInSine,
  easeOutSine,
  easeInOutSine,
};

/**
 * 根据名称获取缓动函数
 */
export function getEasing(name: string): EasingFunction {
  return easingFunctions[name] || linear;
}
