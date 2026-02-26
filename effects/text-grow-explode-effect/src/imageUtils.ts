/**
 * 图片二值化轮廓提取工具（性能优化版）
 * 用于从图片中提取黑白轮廓点
 */

export interface ContourPoint {
  x: number;
  y: number;
  opacity: number;
}

/**
 * 缓动函数（预计算版本）
 */
export const easing = {
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutExpo: (t: number) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2,
};

/**
 * 从图片数据中提取轮廓点（优化版）
 * 减少不必要的计算，使用 TypedArray 提高性能
 */
export function extractContourPoints(
  imageData: ImageData,
  threshold: number = 128,
  sampleDensity: number = 8
): ContourPoint[] {
  const { width, height, data } = imageData;
  const points: ContourPoint[] = [];

  // 预计算常量
  const invThreshold = 1 / threshold;

  for (let y = 0; y < height; y += sampleDensity) {
    for (let x = 0; x < width; x += sampleDensity) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];

      // 快速跳过透明像素
      if (a <= 50) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // 计算灰度值（简化版）
      const gray = (r * 77 + g * 150 + b * 29) >> 8;

      // 只取灰度值低于阈值的点（深色区域）
      if (gray < threshold) {
        points.push({
          x,
          y,
          opacity: 1 - gray * invThreshold
        });
      }
    }
  }

  return points;
}

/**
 * 粒子数据接口
 */
export interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  color: string;
  fontSize: number;
}

/**
 * 生成粒子爆炸数据（优化版）
 * 使用确定性随机，避免 Math.random()
 */
export function generateExplosionParticles(
  centerX: number,
  centerY: number,
  textPool: string[],
  count: number,
  fontSize: number,
  seed: number
): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ff9ff3', '#54a0ff'];
  const poolLength = textPool.length;
  const colorsLength = colors.length;

  // 确定性随机数生成器
  const random = (index: number, offset: number = 0) => {
    const x = Math.sin(seed + index * 0.1 + offset) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (random(i, 1) - 0.5) * 0.3;
    const speed = 8 + random(i, 2) * 12;
    const textIndex = Math.floor(random(i, 3) * poolLength);
    const colorIndex = Math.floor(random(i, 10) * colorsLength);

    particles.push({
      id: i,
      text: textPool[textIndex] || '福',
      x: centerX + (random(i, 4) - 0.5) * 60,
      y: centerY + (random(i, 5) - 0.5) * 60,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed * 0.6 - 5,
      rotation: random(i, 6) * 360,
      rotationSpeed: (random(i, 7) - 0.5) * 15,
      scale: 0.7 + random(i, 8) * 0.5,
      opacity: 0.7 + random(i, 9) * 0.3,
      color: colors[colorIndex],
      fontSize: fontSize * (0.5 + random(i, 11) * 0.6),
    });
  }

  return particles;
}