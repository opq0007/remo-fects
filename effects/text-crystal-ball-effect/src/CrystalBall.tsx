import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Img,
  random,
  spring,
} from "remotion";
import {
  SingleBlessingSymbol,
  BlessingSymbolType,
  MixedContentType,
  BlessingStyleConfig,
  generateTextStyle,
  getImageSrc,
  detectAvailableContent,
  determineContentType,
  getNextContent,
  mergeBlessingStyle,
} from "../../shared/index";

export interface CrystalBallProps {
  contentType?: MixedContentType;
  words?: string[];
  images?: string[];
  imageWeight?: number;
  blessingTypes?: BlessingSymbolType[];
  blessingStyle?: BlessingStyleConfig;
  ballRadius: number;
  ballColor: string;
  ballOpacity: number;
  glowColor: string;
  glowIntensity: number;
  verticalOffset: number;
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  autoRotate: boolean;
  zoomProgress: number;
  zoomEnabled: boolean;
  particleCount: number;
  fontSizeRange: [number, number];
  imageSizeRange: [number, number];
  blessingSizeRange: [number, number];
  textStyle?: { color?: string; effect?: string; effectIntensity?: number; fontWeight?: number };
  perspective: number;
  entranceDuration: number;
  seed: number;
}

interface SphereItem {
  id: number;
  type: "text" | "image" | "blessing";
  content: string;
  theta: number;
  phi: number;
  size: number;
  fontSize?: number;
  opacity: number;
  blessingStyle?: BlessingStyleConfig;
}

const generateFibonacciSpherePoints = (count: number): { theta: number; phi: number }[] => {
  const points: { theta: number; phi: number }[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    points.push({ theta, phi });
  }
  return points;
};

const generateSphereItems = (config: {
  contentType: MixedContentType;
  words: string[];
  images: string[];
  imageWeight: number;
  blessingTypes: BlessingSymbolType[];
  blessingStyle: BlessingStyleConfig;
  particleCount: number;
  fontSizeRange: [number, number];
  imageSizeRange: [number, number];
  blessingSizeRange: [number, number];
  seed: number;
}): SphereItem[] => {
  const { contentType, words, images, imageWeight, blessingTypes, blessingStyle, particleCount, fontSizeRange, imageSizeRange, blessingSizeRange, seed } = config;
  const items: SphereItem[] = [];
  const available = detectAvailableContent({ contentType, words, images, blessingTypes, imageWeight });
  if (available.availableTypes.length === 0) {
    available.availableTypes = ["blessing"];
    available.hasBlessing = true;
  }
  const spherePoints = generateFibonacciSpherePoints(particleCount);
  const counters = { text: 0, image: 0, blessing: 0 };
  for (let i = 0; i < particleCount; i++) {
    const seedValue = seed + i * 1000;
    const { type } = determineContentType({ contentType, words, images, blessingTypes, imageWeight }, available, seedValue);
    const { content } = getNextContent(type, { words, images, blessingTypes }, counters[type]);
    counters[type]++;
    let size: number;
    if (type === "text") {
      size = fontSizeRange[0] + random(`size-${seedValue}`) * (fontSizeRange[1] - fontSizeRange[0]);
    } else if (type === "image") {
      size = imageSizeRange[0] + random(`size-${seedValue}`) * (imageSizeRange[1] - imageSizeRange[0]);
    } else {
      size = blessingSizeRange[0] + random(`size-${seedValue}`) * (blessingSizeRange[1] - blessingSizeRange[0]);
    }
    items.push({
      id: i, type, content,
      theta: spherePoints[i].theta,
      phi: spherePoints[i].phi,
      size,
      fontSize: type === "text" ? size : undefined,
      opacity: 0.7 + random(`opacity-${seedValue}`) * 0.3,
      blessingStyle: type === "blessing" ? mergeBlessingStyle(blessingStyle) : undefined,
    });
  }
  return items;
};

// Text item component
const TextSphereItem: React.FC<{
  item: SphereItem;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  textStyle?: { color?: string; effect?: string; effectIntensity?: number; fontWeight?: number };
  glowIntensity: number;
}> = ({ item, x, y, z, scale, opacity, textStyle, glowIntensity }) => {
  const rotateY = Math.atan2(x, z) * (180 / Math.PI);
  const styles = generateTextStyle(item.fontSize ?? item.size, {
    color: textStyle?.color ?? "#EAF2FF",
    effect: (textStyle?.effect as "gold3d" | "glow" | "shadow" | "none") ?? "glow",
    effectIntensity: textStyle?.effectIntensity ?? 0.6,
    fontWeight: textStyle?.fontWeight ?? 800,
  });
  // 球体远侧轻微失焦（z < 0 为后半球）
  const farBlur = z < 0 ? Math.min(1.4, (-z / Math.max(1, Math.abs(z) + 200)) * 2.4) : 0;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0,
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity, whiteSpace: "nowrap", backfaceVisibility: "hidden",
      filter: farBlur > 0.08 ? `blur(${farBlur.toFixed(2)}px)` : undefined,
      ...styles,
    }}>{item.content}</div>
  );
};

// Image item component
const ImageSphereItem: React.FC<{
  item: SphereItem;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
}> = ({ item, x, y, z, scale, opacity, glowIntensity }) => {
  const rotateY = Math.atan2(x, z) * (180 / Math.PI);
  const farBlur = z < 0 ? Math.min(1.4, (-z / Math.max(1, Math.abs(z) + 200)) * 2.4) : 0;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0,
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity, width: item.size, height: item.size,
      filter: `drop-shadow(0 0 ${item.size * 0.12 * glowIntensity}px rgba(156, 209, 245, ${0.45 * glowIntensity}))${farBlur > 0.08 ? ` blur(${farBlur.toFixed(2)}px)` : ''}`,
      backfaceVisibility: "hidden",
    }}>
      <Img src={getImageSrc(item.content)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
};

// Blessing item component
const BlessingSphereItem: React.FC<{
  item: SphereItem;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
}> = ({ item, x, y, z, scale, opacity, glowIntensity }) => {
  const style = item.blessingStyle ?? {};
  const rotateY = Math.atan2(x, z) * (180 / Math.PI);
  const farBlur = z < 0 ? Math.min(1.4, (-z / Math.max(1, Math.abs(z) + 200)) * 2.4) : 0;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0,
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: farBlur > 0.08 ? `blur(${farBlur.toFixed(2)}px)` : undefined,
      backfaceVisibility: "hidden",
    }}>
      <SingleBlessingSymbol type={item.content as BlessingSymbolType} size={item.size}
        primaryColor={style.primaryColor ?? "#FFD700"} secondaryColor={style.secondaryColor ?? "#FFA500"}
        enable3D={style.enable3D ?? true} enableGlow={style.enableGlow ?? true}
        glowIntensity={style.glowIntensity ?? glowIntensity} />
    </div>
  );
};

// Crystal ball shell
const CrystalBallShell: React.FC<{
  radius: number;
  color: string;
  opacity: number;
  glowColor: string;
  glowIntensity: number;
}> = ({ radius, color, opacity, glowColor, glowIntensity }) => (
  <div style={{
    position: "absolute", left: -radius, top: -radius,
    width: radius * 2, height: radius * 2, borderRadius: "50%",
    background: `
      radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
      radial-gradient(circle at 50% 50%, transparent 0%, ${color}10 50%, ${color}25 80%, ${color}45 100%),
      radial-gradient(ellipse 120% 60% at 50% 110%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.08) 0%, transparent 25%)
    `,
    boxShadow: `
      0 0 ${radius * 0.6 * glowIntensity}px ${glowColor}25,
      0 0 ${radius * 0.3 * glowIntensity}px ${glowColor}40,
      inset 0 0 ${radius * 0.5}px rgba(255, 255, 255, 0.12),
      inset ${radius * 0.08}px ${radius * 0.08}px ${radius * 0.25}px rgba(255, 255, 255, 0.3),
      inset -${radius * 0.04}px -${radius * 0.04}px ${radius * 0.15}px rgba(0, 0, 0, 0.15)
    `,
    opacity, pointerEvents: "none",
  }} />
);

// Sparkle particles
const SparkleParticles: React.FC<{
  radius: number;
  rotationY: number;
  count: number;
  seed: number;
}> = ({ radius, rotationY, count, seed }) => {
  const sparkles = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number; twinkle: number; id: number }[] = [];
    for (let i = 0; i < count; i++) {
      const theta = random(`sparkle-theta-${seed}-${i}`) * Math.PI * 2;
      const phi = random(`sparkle-phi-${seed}-${i}`) * Math.PI;
      const r = radius * (0.4 + random(`sparkle-r-${seed}-${i}`) * 0.5);
      const x0 = r * Math.sin(phi) * Math.sin(theta);
      const y0 = r * Math.cos(phi);
      const z0 = r * Math.sin(phi) * Math.cos(theta);
      const cosRY = Math.cos(rotationY), sinRY = Math.sin(rotationY);
      const x = x0 * cosRY + z0 * sinRY;
      const z = -x0 * sinRY + z0 * cosRY;
      const y = y0;
      const size = 2 + random(`sparkle-size-${seed}-${i}`) * 3;
      const twinkle = Math.sin(rotationY * 10 + i) * 0.3 + 0.7;
      result.push({ x, y, z, size, twinkle, id: i });
    }
    return result;
  }, [radius, rotationY, count, seed]);
  return (
    <>
      {sparkles.map(s => {
        const zNorm = (s.z + radius) / (2 * radius);
        const op = s.z > 0 ? s.twinkle * zNorm : s.twinkle * zNorm * 0.3;
        return (
          <div key={s.id} style={{
            position: "absolute", left: 0, top: 0, width: s.size, height: s.size, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255, 255, 255, ${op}) 0%, transparent 70%)`,
            transform: `translate3d(${s.x}px, ${s.y}px, ${s.z}px)`,
          }} />
        );
      })}
    </>
  );
};

// Main CrystalBall component
export const CrystalBall: React.FC<CrystalBallProps> = ({
  contentType = "text", words = [], images = [], imageWeight = 0.5,
  blessingTypes = [], blessingStyle = {}, ballRadius = 200,
  ballColor = "#4169E1", ballOpacity = 0.3, glowColor = "#87CEEB", glowIntensity = 1,
  verticalOffset = 0.5, rotationSpeedX = 0.2, rotationSpeedY = 0.5, rotationSpeedZ = 0.1,
  autoRotate = true, zoomProgress = 0, zoomEnabled = false, particleCount = 30,
  fontSizeRange = [30, 60], imageSizeRange = [40, 80], blessingSizeRange = [35, 70],
  textStyle = {}, perspective = 1000, entranceDuration = 30, seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const centerX = width / 2;
  const centerY = interpolate(verticalOffset, [0, 1], [ballRadius + 50, height - ballRadius - 50]);
  // 欠阻尼弹簧入场：水晶球"落定"带一次轻微过冲，替代线性渐显
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
  });
  const entranceScale = 0.5 + entranceSpring * 0.5;
  const entranceOpacity = Math.min(1, entranceSpring * 1.5);
  const zoomScale = zoomEnabled ? interpolate(zoomProgress, [0, 1], [1, 1.8]) : 1;
  const zoomZ = zoomEnabled ? interpolate(zoomProgress, [0, 1], [0, -200]) : 0;
  const rotX = autoRotate ? frame * rotationSpeedX * 0.02 : 0;
  const rotY = autoRotate ? frame * rotationSpeedY * 0.02 : 0;
  const rotZ = autoRotate ? frame * rotationSpeedZ * 0.02 : 0;

  const sphereItems = useMemo(() => generateSphereItems({
    contentType, words, images, imageWeight,
    blessingTypes: blessingTypes.length > 0 ? blessingTypes : ["goldCoin", "moneyBag", "luckyBag", "redPacket", "star", "heart", "balloon"],
    blessingStyle, particleCount, fontSizeRange, imageSizeRange, blessingSizeRange, seed,
  }), [contentType, words, images, imageWeight, blessingTypes, blessingStyle, particleCount, fontSizeRange, imageSizeRange, blessingSizeRange, seed]);

  const contentRadius = ballRadius * 0.85;
  const itemsWithPos = useMemo(() => {
    return sphereItems.map(item => {
      const x0 = contentRadius * Math.sin(item.phi) * Math.sin(item.theta);
      const y0 = contentRadius * Math.cos(item.phi);
      const z0 = contentRadius * Math.sin(item.phi) * Math.cos(item.theta);
      const cosRY = Math.cos(rotY), sinRY = Math.sin(rotY);
      const x = x0 * cosRY + z0 * sinRY;
      const z = -x0 * sinRY + z0 * cosRY;
      const y = y0;
      const cosRX = Math.cos(rotX), sinRX = Math.sin(rotX);
      const y2 = y * cosRX - z * sinRX;
      const z2 = y * sinRX + z * cosRX;
      const zNorm = (z2 + contentRadius) / (2 * contentRadius);
      const scale = 0.5 + zNorm * 0.7;
      // 后面的文字几乎不可见（透明度极低），前面的文字清晰可见
      const depthOp = z2 > 0 
        ? 0.7 + zNorm * 0.3   // 前面：0.7-1.0
        : 0.05 + zNorm * 0.25; // 后面：0.05-0.3（几乎不可见）
      return { ...item, x, y: y2, z: z2, scale, opacity: depthOp * item.opacity, sortZ: z2 };
    }).sort((a, b) => a.sortZ - b.sortZ);
  }, [sphereItems, rotY, rotX, contentRadius]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: centerX, top: centerY, width: 0, height: 0, perspective: `${perspective}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d", transform: `translateZ(${zoomZ}px) scale(${entranceScale * zoomScale}) rotateZ(${rotZ}rad)`, opacity: entranceOpacity }}>
          {/* 内容层 - 在球壳内部 */}
          {itemsWithPos.map(item => {
            const props = { x: item.x, y: item.y, z: item.z, scale: item.scale, opacity: item.opacity, glowIntensity };
            if (item.type === "text") return <TextSphereItem key={item.id} item={item} {...props} textStyle={textStyle} />;
            if (item.type === "image") return <ImageSphereItem key={item.id} item={item} {...props} />;
            return <BlessingSphereItem key={item.id} item={item} {...props} />;
          })}
          {/* 星光粒子 */}
          <SparkleParticles radius={ballRadius * 0.6} rotationY={rotY} count={15} seed={seed} />
          {/* 水晶球外壳 - 最上层，作为遮罩让内容看起来在球内 */}
          <CrystalBallShell radius={ballRadius} color={ballColor} opacity={ballOpacity} glowColor={glowColor} glowIntensity={glowIntensity} />
        </div>
      </div>
    </AbsoluteFill>
  );
};