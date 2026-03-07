/**
 * 特效渲染器组件
 * 
 * 在 project 层导入各特效项目的核心效果组件，并提供统一的渲染函数
 * 用于 StoryChapter 的渲染委托模式
 * 
 * 注意：由于各特效组件的 Props 结构差异较大，这里使用类型断言进行适配
 */

import React from 'react';
import { PlusEffectItemProps, type MixedItemType } from '@shared/schemas';
// 导入混合输入工具函数，复用 shared 中的公共逻辑
import {
  getAvailableTypes,
  createSeededRandomGenerator,
  selectRandomType,
  selectRandomContent,
} from '../../../effects/shared/utils';

// ==================== 导入各特效项目的核心效果组件 ====================

// 文字矢量动画
import { TextVectorAnimation } from '../../../effects/text-vector-effect/src/TextVectorAnimation';
// 大风车
import { Windmill } from '../../../effects/text-windmill-effect/src/Windmill';
// 太极图
import { TaiChi } from '../../../effects/tai-chi-bagua-effect/src/TaiChi';
// 文字雨
import { TextRain } from '../../../effects/text-rain-effect/src/TextRain';
// 文字环绕
import { TextRing } from '../../../effects/text-ring-effect/src/TextRing';
// 文字烟花（Firework.tsx）
import { Firework } from '../../../effects/text-firework-effect/src/Firework';
// 文字破屏
import { TextBreakthrough } from '../../../effects/text-breakthrough-effect/src/TextBreakthrough';
// 文字龙卷风
import { TextTornado } from '../../../effects/text-tornado-effect/src/TextTornado';
// 文字洪水
import { TextFlood } from '../../../effects/text-flood-effect/src/TextFlood';
// 文字旋涡
import { TextVortex } from '../../../effects/text-vortex-effect/src/TextVortex';
// 文字万花筒
import { Kaleidoscope } from '../../../effects/text-kaleidoscope-effect/src/Kaleidoscope';
// 文字水晶球
import { CrystalBall } from '../../../effects/text-crystal-ball-effect/src/CrystalBall';

// ==================== 默认配置 ====================

const DEFAULT_COLORS = [
  '#FFD700', // 金色
  '#FF6B6B', // 珊瑚红
  '#4ECDC4', // 青绿
  '#45B7D1', // 天蓝
  '#96CEB4', // 薄荷绿
  '#FFEAA7', // 淡金
];

// ==================== 渲染函数签名类型 ====================

export interface RenderPlusEffectsOptions {
  width: number;
  height: number;
}

// ==================== 渲染函数 ====================

/**
 * 渲染 PlusEffects 列表
 * 
 * @param effects - PlusEffectItemProps 数组
 * @param fallbackWords - 默认文字列表（当 effect.words 为空时使用）
 * @param options - 渲染选项（包含 width 和 height）
 * @returns ReactNode
 */
export function renderPlusEffects(
  effects: PlusEffectItemProps[],
  fallbackWords: string[],
  options?: RenderPlusEffectsOptions
): React.ReactNode {
  if (!effects || effects.length === 0) return null;

  return (
    <>
      {effects.map((effect, index) => {
        const {
          effectType,
          words = [],
          fontSize = 100,
          colors,
          primaryColor = '#FFD700',
          secondaryColor = '#FF6B6B',
          glowColor,
          glowIntensity = 1,
          x = 0.5,
          y = 0.5,
          scale = 1,
          opacity = 1,
          seed = index * 1000,
        } = effect;

        // 默认颜色列表
        const effectiveColors = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
        const effectiveGlowColor = glowColor ?? effectiveColors[0];

        // 有效文字列表
        const effectiveWords = words.length > 0 ? words : fallbackWords;
        const fallbackText = fallbackWords[0] ?? '福';

        // 视口尺寸
        const viewWidth = options?.width ?? 720;
        const viewHeight = options?.height ?? 1280;

        // 判断是否为全屏特效（需要填满整个画布）
        const isFullScreenEffect = ['textRain', 'textVortex', 'textTornado', 'textFlood', 'textKaleidoscope', 'textFirework'].includes(effectType);

        // 容器样式 - 根据特效类型使用不同的定位策略
        // 全屏特效：使用全屏容器
        // 定位特效：使用 x/y 定位
        const containerStyle: React.CSSProperties = isFullScreenEffect
          ? {
              position: 'absolute',
              left: 0,
              top: 0,
              width: viewWidth,
              height: viewHeight,
              opacity,
              zIndex: 25 + index, // 每个特效使用不同的 zIndex，避免覆盖
              pointerEvents: 'none',
            }
          : {
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              zIndex: 25 + index, // 每个特效使用不同的 zIndex
              pointerEvents: 'none',
            };

        // 根据 effectType 渲染对应的核心效果组件
        // 注意：使用类型断言适配各组件的 Props 结构
        switch (effectType) {
          case 'textVector': {
            // 文字矢量动画效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextVectorAnimation
                  text={effect.text ?? effectiveWords[0] ?? fallbackText}
                  words={effectiveWords}
                  images={effect.images}
                  blessingTypes={effect.blessingTypes}
                  contentType={effect.contentType ?? 'text'}
                  imageWeight={effect.imageWeight ?? 0.5}
                  fontSize={fontSize}
                  colors={effectiveColors}
                  glowColor={effectiveGlowColor}
                  glowIntensity={glowIntensity}
                  entranceDuration={effect.entranceDuration ?? 15}
                  fillDuration={90}
                  fillType="sequential"
                  stayAnimation={effect.stayAnimation ?? 'pulse'}
                  enable3D={effect.enable3D ?? true}
                  rotation3D={effect.rotation3D}
                  seed={seed}
                  blessingStyle={effect.blessingStyle}
                />
              </div>
            );
          }

          case 'windmill': {
            // 大风车效果
            const bladesData = effectiveWords.map(word => [{ type: 'text' as const, content: word }]);
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <Windmill
                  bladesData={bladesData}
                  colors={effectiveColors}
                  glowColor={effectiveGlowColor}
                  fontSize={fontSize * 0.6}
                  rotationSpeed={effect.rotationSpeed ?? 0.3}
                  rotationDirection="clockwise"
                  centerOffsetY={(y ?? 0.5) - 0.5}
                  tiltAngle={effect.enable3D !== false ? 30 : 0}
                  rotateY={0}
                  perspective={effect.perspective ?? 1000}
                  enableGlow={true}
                  glowIntensity={glowIntensity}
                  appearDuration={effect.entranceDuration ?? 30}
                  itemRotateWithBlade={false}
                  bladeLengthRatio={0.7}
                  enableRandomBladeLength={false}
                  blessingStyle={effect.blessingStyle}
                />
              </div>
            );
          }

          case 'taiChiBagua': {
            // 太极八卦效果
            const size = fontSize * 2;
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TaiChi
                  size={size}
                  yangColor={primaryColor}
                  yinColor={secondaryColor}
                  glowIntensity={glowIntensity}
                  rotationSpeed={effect.rotationSpeed ?? 1}
                  pulseSpeed={1.5}
                />
              </div>
            );
          }

          case 'textRain': {
            // 文字雨效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextRain
                  words={effectiveWords}
                  images={effect.images}
                  contentType={effect.contentType ?? 'text'}
                  imageWeight={effect.imageWeight ?? 0.5}
                  blessingTypes={effect.blessingTypes}
                  blessingStyle={effect.blessingStyle}
                  textDirection="horizontal"
                  fallDirection="down"
                  density={2}
                  fallSpeed={effect.animationSpeed ?? 0.2}
                  fontSizeRange={[fontSize * 0.4, fontSize * 0.8] as [number, number]}
                  imageSizeRange={[fontSize * 0.5, fontSize] as [number, number]}
                  opacityRange={[0.6, 1] as [number, number]}
                  rotationRange={[-10, 10] as [number, number]}
                  seed={seed ?? 42}
                  laneCount={8}
                  minVerticalGap={140}
                  textStyle={{
                    color: effectiveColors[0],
                    effect: 'gold3d' as const,
                    effectIntensity: glowIntensity * 0.8,
                  }}
                  imageStyle={{
                    glow: true,
                    glowColor: effectiveGlowColor,
                    glowIntensity: glowIntensity * 0.6,
                  }}
                />
              </div>
            );
          }

          case 'textRing': {
            // 文字环绕效果 - 使用 TextRingProps 的正确属性
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextRing
                  contentType={effect.contentType ?? 'text'}
                  words={effectiveWords}
                  images={effect.images}
                  imageWeight={effect.imageWeight ?? 0.5}
                  blessingTypes={effect.blessingTypes}
                  blessingStyle={effect.blessingStyle}
                  fontSize={fontSize * 0.5}
                  opacity={0.9}
                  ringRadius={200}
                  rotationSpeed={effect.rotationSpeed ?? 0.5}
                  seed={seed}
                  glowIntensity={glowIntensity}
                  depth3d={30}
                  cylinderHeight={300}
                  perspective={1000}
                  mode="vertical"
                  imageSizeRange={[fontSize * 0.3, fontSize * 0.6] as [number, number]}
                  blessingSizeRange={[fontSize * 0.3, fontSize * 0.6] as [number, number]}
                  textStyle={{
                    color: effectiveColors[0],
                    effect: 'gold3d',
                    effectIntensity: glowIntensity * 0.8,
                  }}
                />
              </div>
            );
          }

          case 'textFirework': {
            // 文字烟花效果 - 创建多个烟花分布在时间轴上
            // 支持混合内容：文字 + 祝福图案
            // 注意：Firework 组件的位置参数需要像素值
            
            const fireworkCount = Math.max(effectiveWords.length, 4);
            const totalDuration = 600; // 烟花总持续时间（帧）
            const interval = Math.floor(totalDuration / fireworkCount);
            
            // 使用 shared 工具函数获取可用类型和有效祝福图案
            const mixedConfig = {
              words: effectiveWords,
              images: effect.images,
              blessingTypes: effect.blessingTypes,
              contentType: effect.contentType ?? 'mixed',
              imageWeight: effect.imageWeight ?? 0.5,
            };
            const availableTypes = getAvailableTypes(mixedConfig);
            
            // 生成多个烟花
            const fireworks = [];
            for (let i = 0; i < fireworkCount; i++) {
              // 使用 shared 工具函数创建随机生成器
              const random = createSeededRandomGenerator(seed + i * 100);
              
              // 使用 shared 工具函数随机选择内容类型和内容
              const selectedType = selectRandomType(availableTypes, random, effect.imageWeight ?? 0.5);
              const selectedContent = selectRandomContent(selectedType, mixedConfig, random);
              
              const launchFrame = i * interval;
              const explodeFrame = launchFrame + 30; // 发射后30帧爆炸
              
              // 随机位置（基于 seed）- 转换为像素值
              // startX: 20% 到 80% 宽度
              const startX = viewWidth * 0.2 + random() * viewWidth * 0.6;
              // startY: 从底部发射
              const startY = viewHeight + 20;
              // targetX: 15% 到 85% 宽度
              const targetX = viewWidth * 0.15 + random() * viewWidth * 0.7;
              // targetY: 15% 到 35% 高度（爆炸高度）
              const targetY = viewHeight * (0.15 + random() * 0.2);
              
              fireworks.push(
                <Firework
                  key={`firework-${i}`}
                  contentType={selectedType}
                  text={selectedType === 'text' ? selectedContent : undefined}
                  blessingType={selectedType === 'blessing' ? selectedContent as any : undefined}
                  blessingStyle={effect.blessingStyle}
                  startX={startX}
                  startY={startY}
                  targetX={targetX}
                  targetY={targetY}
                  launchFrame={launchFrame}
                  explodeFrame={explodeFrame}
                  fontSize={fontSize * 0.6}
                  textColor={effectiveColors[i % effectiveColors.length]}
                  glowColor={effectiveGlowColor}
                  glowIntensity={glowIntensity}
                  particleCount={30 + Math.floor(random() * 20)}
                />
              );
            }
            
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                {fireworks}
              </div>
            );
          }

          case 'textBreakthrough': {
            // 文字破屏效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextBreakthrough
                  contentType="text"
                  text={effectiveWords[0] ?? fallbackText}
                  startFrame={0}
                  startZ={-1000}
                  endZ={200}
                  startX={0}
                  startY={0}
                  endX={0}
                  endY={0}
                  fontSize={fontSize}
                  fontFamily="Arial"
                  fontWeight={700}
                  textColor={effectiveColors[0]}
                  glowColor={effectiveGlowColor}
                  secondaryGlowColor={effectiveColors[1] ?? effectiveColors[0]}
                  glowIntensity={glowIntensity}
                  bevelDepth={5}
                  approachDuration={30}
                  breakthroughDuration={15}
                  holdDuration={60}
                  impactScale={1.3}
                  impactRotation={5}
                  shakeIntensity={10}
                />
              </div>
            );
          }

          case 'textTornado': {
            // 文字龙卷风效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextTornado
                  contentType={effect.contentType ?? 'text'}
                  words={effectiveWords}
                  images={effect.images}
                  imageWeight={effect.imageWeight ?? 0.5}
                  blessingTypes={effect.blessingTypes}
                  blessingStyle={effect.blessingStyle}
                  particleCount={50}
                  baseRadius={80}
                  topRadius={200}
                  rotationSpeed={effect.rotationSpeed ?? 1}
                  liftSpeed={0.5}
                  funnelHeight={600}
                  fontSizeRange={[fontSize * 0.3, fontSize * 0.6] as [number, number]}
                  imageSizeRange={[fontSize * 0.4, fontSize * 0.8] as [number, number]}
                  blessingSizeRange={[fontSize * 0.4, fontSize * 0.8] as [number, number]}
                  zoomIntensity={0.3}
                  entranceDuration={effect.entranceDuration ?? 30}
                  swirlIntensity={0.5}
                  textStyle={{
                    color: effectiveColors[0],
                    effect: 'gold3d',
                    effectIntensity: glowIntensity * 0.8,
                  }}
                  seed={seed}
                />
              </div>
            );
          }

          case 'textFlood': {
            // 文字洪水效果 - 使用混合输入模式
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextFlood
                  words={effectiveWords}
                  images={effect.images}
                  blessingTypes={effect.blessingTypes}
                  contentType={effect.contentType ?? 'text'}
                  imageWeight={effect.imageWeight ?? 0.5}
                />
              </div>
            );
          }

          case 'textVortex': {
            // 文字旋涡效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <TextVortex
                  contentType={effect.contentType ?? 'text'}
                  words={effectiveWords}
                  images={effect.images}
                  imageWeight={effect.imageWeight ?? 0.5}
                  blessingTypes={effect.blessingTypes}
                  blessingStyle={effect.blessingStyle}
                  particleCount={60}
                  ringCount={5}
                  rotationSpeed={effect.rotationSpeed ?? 1}
                  expansionDuration={60}
                  maxRadius={300}
                  perspective={1000}
                  fontSizeRange={[fontSize * 0.3, fontSize * 0.5] as [number, number]}
                  imageSizeRange={[fontSize * 0.4, fontSize * 0.7] as [number, number]}
                  blessingSizeRange={[fontSize * 0.4, fontSize * 0.7] as [number, number]}
                  textStyle={{
                    color: effectiveColors[0],
                    effect: 'gold3d',
                    effectIntensity: glowIntensity * 0.8,
                  }}
                  seed={seed}
                />
              </div>
            );
          }

          case 'textKaleidoscope': {
            // 文字万花筒效果
            const contentItems = effectiveWords.map(word => ({
              type: 'text' as const,
              content: word,
            }));
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <Kaleidoscope
                  contentItems={contentItems}
                  colors={effectiveColors}
                  glowColor={effectiveGlowColor}
                  baseFontSize={fontSize * 0.4}
                  itemCount={effectiveWords.length * 3}
                  ringCount={4}
                  rotationSpeed={effect.rotationSpeed ?? 0.5}
                  expansionDuration={45}
                  fadeInDuration={15}
                  stayDuration={60}
                  startFrame={0}
                  enable3D={effect.enable3D ?? true}
                  enableGlow={true}
                  glowIntensity={glowIntensity}
                  blessingStyle={effect.blessingStyle}
                />
              </div>
            );
          }

          case 'textCrystalBall': {
            // 文字水晶球效果
            return (
              <div key={`plusEffect-${index}`} style={containerStyle}>
                <CrystalBall
                  contentType={effect.contentType ?? 'text'}
                  words={effectiveWords}
                  images={effect.images}
                  imageWeight={effect.imageWeight ?? 0.5}
                  blessingTypes={effect.blessingTypes}
                  blessingStyle={effect.blessingStyle}
                  ballRadius={fontSize * 1.5}
                  ballColor="rgba(100, 150, 255, 0.15)"
                  ballOpacity={0.3}
                  glowColor={effectiveGlowColor}
                  glowIntensity={glowIntensity}
                  verticalOffset={0}
                  rotationSpeedX={0.3}
                  rotationSpeedY={0.5}
                  rotationSpeedZ={0.1}
                  autoRotate={true}
                  zoomProgress={0}
                  zoomEnabled={false}
                  particleCount={30}
                  fontSizeRange={[fontSize * 0.3, fontSize * 0.6] as [number, number]}
                  imageSizeRange={[fontSize * 0.4, fontSize * 0.8] as [number, number]}
                  blessingSizeRange={[fontSize * 0.4, fontSize * 0.8] as [number, number]}
                  textStyle={{
                    color: effectiveColors[0],
                    effect: 'gold3d',
                    effectIntensity: glowIntensity * 0.8,
                    fontWeight: 600,
                  }}
                  perspective={1000}
                  entranceDuration={effect.entranceDuration ?? 30}
                  seed={seed}
                />
              </div>
            );
          }

          default:
            // 未知类型，不渲染
            return null;
        }
      })}
    </>
  );
}

// 导出默认配置供外部使用
export { DEFAULT_COLORS };