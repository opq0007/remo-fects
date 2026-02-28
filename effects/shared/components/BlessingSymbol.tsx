import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

/**
 * 祝福图案类型
 */
export type BlessingSymbolType =
  | "goldCoin"       // 金币
  | "moneyBag"       // 金钱袋
  | "luckyBag"       // 福袋
  | "redPacket";     // 红包

/**
 * 单个图案配置
 */
export interface SingleSymbolConfig {
  /** 图案类型 */
  type: BlessingSymbolType;
  /** X 位置 (0-100 百分比) */
  x: number;
  /** Y 位置 (0-100 百分比) */
  y: number;
  /** 大小系数 (0.1-3) */
  scale?: number;
  /** 旋转角度 */
  rotation?: number;
  /** 透明度 (0-1) */
  opacity?: number;
  /** 主颜色 */
  primaryColor?: string;
  /** 次颜色（用于渐变或装饰） */
  secondaryColor?: string;
  /** 是否启用3D效果 */
  enable3D?: boolean;
  /** 是否启用发光效果 */
  enableGlow?: boolean;
  /** 发光强度 */
  glowIntensity?: number;
  /** 是否启用动画 */
  animated?: boolean;
  /** 动画延迟 */
  animationDelay?: number;
}

/**
 * 批量生成配置
 */
export interface BatchGenerateConfig {
  /** 图案类型 */
  type: BlessingSymbolType;
  /** 生成数量 */
  count: number;
  /** 随机种子 */
  seed?: number;
  /** 最小 X 位置 */
  minX?: number;
  /** 最大 X 位置 */
  maxX?: number;
  /** 最小 Y 位置 */
  minY?: number;
  /** 最大 Y 位置 */
  maxY?: number;
  /** 最小缩放 */
  minScale?: number;
  /** 最大缩放 */
  maxScale?: number;
  /** 最小旋转角度 */
  minRotation?: number;
  /** 最大旋转角度 */
  maxRotation?: number;
  /** 透明度范围 */
  opacityRange?: [number, number];
  /** 主颜色（固定或数组随机选择） */
  primaryColors?: string | string[];
  /** 次颜色（固定或数组随机选择） */
  secondaryColors?: string | string[];
  /** 是否启用3D效果 */
  enable3D?: boolean;
  /** 是否启用发光效果 */
  enableGlow?: boolean;
  /** 发光强度范围 */
  glowIntensityRange?: [number, number];
  /** 是否启用动画 */
  animated?: boolean;
}

/**
 * BlessingSymbol 组件 Props
 */
export interface BlessingSymbolProps {
  /** 单个图案配置数组 */
  symbols?: SingleSymbolConfig[];
  /** 批量生成配置数组 */
  batchConfigs?: BatchGenerateConfig[];
  /** 全局默认主颜色 */
  defaultPrimaryColor?: string;
  /** 全局默认次颜色 */
  defaultSecondaryColor?: string;
  /** 全局默认是否启用3D效果 */
  defaultEnable3D?: boolean;
  /** 全局默认是否启用发光效果 */
  defaultEnableGlow?: boolean;
  /** 全局默认发光强度 */
  defaultGlowIntensity?: number;
  /** 全局动画速度系数 */
  animationSpeed?: number;
}

// 默认颜色配置
const DEFAULT_PRIMARY_COLOR = "#FFD700";
const DEFAULT_SECONDARY_COLOR = "#FFA500";

/**
 * 伪随机数生成器
 */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * 绘制金币 SVG（穿孔钱样式：外圆内方）
 */
const GoldCoin: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
}> = ({ primaryColor, secondaryColor, enable3D, enableGlow, glowIntensity }) => {
  const glowFilter = enableGlow
    ? `drop-shadow(0 0 ${3 * glowIntensity}px ${primaryColor})`
    : undefined;

  return (
    <svg viewBox="0 0 60 60" style={{ filter: glowFilter }}>
      <defs>
        <radialGradient id="coinGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="30%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </radialGradient>
      </defs>
      {/* 金币主体 */}
      <circle cx="30" cy="30" r="28" fill="url(#coinGradient)" />
      {/* 边缘 */}
      <circle cx="30" cy="30" r="25" fill="none" stroke={enable3D ? "#B8860B" : secondaryColor} strokeWidth="2" />
      {/* 内圈 */}
      <circle cx="30" cy="30" r="18" fill="none" stroke={primaryColor} strokeWidth="1.5" opacity="0.8" />
      {/* 方孔（铜钱样式）- 增大方孔尺寸 */}
      <rect x="22" y="22" width="16" height="16" fill={enable3D ? "#B8860B" : secondaryColor} />
      {/* 方孔内边框 */}
      <rect x="24" y="24" width="12" height="12" fill="none" stroke={primaryColor} strokeWidth="0.5" opacity="0.5" />
      {/* 高光 */}
      <ellipse cx="20" cy="20" rx="8" ry="6" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
};

/**
 * 绘制金钱袋 SVG
 */
const MoneyBag: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
}> = ({ primaryColor, secondaryColor, enable3D, enableGlow, glowIntensity }) => {
  const glowFilter = enableGlow
    ? `drop-shadow(0 0 ${4 * glowIntensity}px ${primaryColor})`
    : undefined;

  return (
    <svg viewBox="0 0 80 100" style={{ filter: glowFilter }}>
      <defs>
        <linearGradient id="bagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#6B3E0A" />
        </linearGradient>
        <linearGradient id="coinTopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
        <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="50%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
      {/* 袋子主体 */}
      <ellipse cx="40" cy="65" rx="35" ry="30" fill="url(#bagGradient)" />
      {/* 袋口绑带 */}
      <ellipse cx="40" cy="38" rx="20" ry="8" fill="#8B4513" />
      
      {/* 捆绑绳子 - 环绕袋口 */}
      <ellipse cx="40" cy="35" rx="18" ry="6" fill="none" stroke="url(#ropeGradient)" strokeWidth="3" />
      {/* 绳结 - 左侧 */}
      <circle cx="22" cy="35" r="4" fill={primaryColor} />
      {/* 绳结 - 右侧 */}
      <circle cx="58" cy="35" r="4" fill={primaryColor} />
      {/* 绳子下垂部分 - 左 */}
      <path d="M 22 39 Q 18 50 22 60" fill="none" stroke="url(#ropeGradient)" strokeWidth="2" />
      {/* 绳子下垂部分 - 右 */}
      <path d="M 58 39 Q 62 50 58 60" fill="none" stroke="url(#ropeGradient)" strokeWidth="2" />
      {/* 绳头装饰 */}
      <circle cx="22" cy="62" r="2" fill={primaryColor} />
      <circle cx="58" cy="62" r="2" fill={primaryColor} />
      
      {/* 袋口 */}
      <ellipse cx="40" cy="35" rx="12" ry="5" fill="#6B3E0A" />
      {/* 顶部金币 */}
      <ellipse cx="40" cy="28" rx="10" ry="6" fill={primaryColor} />
      <ellipse cx="40" cy="26" rx="8" ry="4" fill="url(#coinTopGradient)" />
      {/* 袋子高光 */}
      {enable3D && (
        <ellipse cx="30" cy="55" rx="12" ry="18" fill="rgba(255,255,255,0.1)" />
      )}
      {/* $ 符号 */}
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill={primaryColor}
      >
        $
      </text>
    </svg>
  );
};

/**
 * 绘制福袋 SVG
 */
const LuckyBag: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
}> = ({ primaryColor, secondaryColor, enable3D, enableGlow, glowIntensity }) => {
  const glowFilter = enableGlow
    ? `drop-shadow(0 0 ${4 * glowIntensity}px ${primaryColor})`
    : undefined;

  return (
    <svg viewBox="0 0 80 100" style={{ filter: glowFilter }}>
      <defs>
        <linearGradient id="luckyBagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC143C" />
          <stop offset="50%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>
        <linearGradient id="luckyRopeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="50%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
      </defs>
      {/* 袋子主体 */}
      <ellipse cx="40" cy="65" rx="35" ry="30" fill="url(#luckyBagGradient)" />
      {/* 袋口绑带 */}
      <ellipse cx="40" cy="40" rx="22" ry="8" fill="#FFD700" />
      
      {/* 捆绑绳子 - 环绕袋口 */}
      <ellipse cx="40" cy="38" rx="20" ry="6" fill="none" stroke="url(#luckyRopeGradient)" strokeWidth="3" />
      {/* 绳结 - 左侧 */}
      <circle cx="20" cy="38" r="4" fill={primaryColor} />
      {/* 绳结 - 右侧 */}
      <circle cx="60" cy="38" r="4" fill={primaryColor} />
      {/* 绳子下垂部分 - 左 */}
      <path d="M 20 42 Q 16 52 20 62" fill="none" stroke="url(#luckyRopeGradient)" strokeWidth="2" />
      {/* 绳子下垂部分 - 右 */}
      <path d="M 60 42 Q 64 52 60 62" fill="none" stroke="url(#luckyRopeGradient)" strokeWidth="2" />
      {/* 绳头装饰 */}
      <circle cx="20" cy="64" r="2.5" fill={primaryColor} />
      <circle cx="60" cy="64" r="2.5" fill={primaryColor} />
      
      {/* 袋口 */}
      <ellipse cx="40" cy="38" rx="14" ry="6" fill="#8B0000" />
      {/* 福字 */}
      <text
        x="40"
        y="75"
        textAnchor="middle"
        fontSize="28"
        fontWeight="bold"
        fill={primaryColor}
        style={{ fontFamily: "serif" }}
      >
        福
      </text>
      {/* 高光 */}
      {enable3D && (
        <ellipse cx="28" cy="55" rx="10" ry="15" fill="rgba(255,255,255,0.15)" />
      )}
    </svg>
  );
};

/**
 * 绘制红包 SVG
 */
const RedPacket: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
}> = ({ primaryColor, secondaryColor, enable3D, enableGlow, glowIntensity }) => {
  const glowFilter = enableGlow
    ? `drop-shadow(0 0 ${4 * glowIntensity}px #FF0000) drop-shadow(0 0 ${8 * glowIntensity}px #FFD700)`
    : undefined;

  return (
    <svg viewBox="0 0 80 100" style={{ filter: glowFilter }}>
      <defs>
        {/* 红包主体渐变 */}
        <linearGradient id="redPacketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4444" />
          <stop offset="30%" stopColor="#FF0000" />
          <stop offset="70%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#990000" />
        </linearGradient>
        
        {/* 封口装饰渐变 */}
        <linearGradient id="sealGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="50%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* 金边渐变 */}
        <linearGradient id="goldBorderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="50%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      
      {/* 红包主体 */}
      <rect x="5" y="5" width="70" height="90" rx="5" ry="5" fill="url(#redPacketGradient)" />
      
      {/* 金边框 */}
      <rect x="5" y="5" width="70" height="90" rx="5" ry="5" fill="none" stroke="url(#goldBorderGradient)" strokeWidth="2" />
      
      {/* 封口翻盖 */}
      <path
        d="M 5 5 L 40 30 L 75 5"
        fill="#CC0000"
        stroke="url(#goldBorderGradient)"
        strokeWidth="1"
      />
      
      {/* 封口装饰线 */}
      <path
        d="M 15 5 Q 40 25 65 5"
        fill="none"
        stroke={primaryColor}
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* 中心圆形装饰 */}
      <circle cx="40" cy="55" r="18" fill={primaryColor} />
      <circle cx="40" cy="55" r="15" fill="none" stroke={secondaryColor} strokeWidth="1" />
      
      {/* 福字 */}
      <text
        x="40"
        y="62"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#CC0000"
        style={{ fontFamily: "serif" }}
      >
        福
      </text>
      
      {/* 高光效果 */}
      {enable3D && (
        <ellipse cx="25" cy="35" rx="8" ry="20" fill="rgba(255,255,255,0.1)" />
      )}
      
      {/* 底部装饰 */}
      <path
        d="M 15 85 Q 25 80 40 82 Q 55 80 65 85"
        fill="none"
        stroke={primaryColor}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
};

/**
 * 根据类型渲染对应的图案
 */
const SymbolRenderer: React.FC<{
  type: BlessingSymbolType;
  primaryColor: string;
  secondaryColor: string;
  enable3D: boolean;
  enableGlow: boolean;
  glowIntensity: number;
}> = ({ type, ...props }) => {
  switch (type) {
    case "goldCoin":
      return <GoldCoin {...props} />;
    case "moneyBag":
      return <MoneyBag {...props} />;
    case "luckyBag":
      return <LuckyBag {...props} />;
    case "redPacket":
      return <RedPacket {...props} />;
    default:
      return <GoldCoin {...props} />;
  }
};

/**
 * 单个图案组件
 */
const SingleSymbol: React.FC<{
  config: SingleSymbolConfig;
  defaultProps: {
    primaryColor: string;
    secondaryColor: string;
    enable3D: boolean;
    enableGlow: boolean;
    glowIntensity: number;
    animated: boolean;
    animationSpeed: number;
  };
}> = ({ config, defaultProps }) => {
  const frame = useCurrentFrame();
  
  const scale = config.scale ?? 1;
  const rotation = config.rotation ?? 0;
  const opacity = config.opacity ?? 1;
  const animated = config.animated ?? defaultProps.animated;
  const animationDelay = config.animationDelay ?? 0;

  // 动画效果
  let animatedScale = scale;
  let animatedRotation = rotation;
  let animatedOpacity = opacity;

  if (animated) {
    const animFrame = frame - animationDelay;
    if (animFrame > 0) {
      // 缓慢旋转
      animatedRotation = rotation + animFrame * 0.5 * defaultProps.animationSpeed;
      // 呼吸缩放效果
      const breathe = Math.sin(animFrame * 0.05 * defaultProps.animationSpeed) * 0.1;
      animatedScale = scale * (1 + breathe);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: 60 * scale,
        height: 60 * scale,
        transform: `translate(-50%, -50%) rotate(${animatedRotation}deg) scale(${animatedScale})`,
        opacity: animatedOpacity,
      }}
    >
      <SymbolRenderer
        type={config.type}
        primaryColor={config.primaryColor ?? defaultProps.primaryColor}
        secondaryColor={config.secondaryColor ?? defaultProps.secondaryColor}
        enable3D={config.enable3D ?? defaultProps.enable3D}
        enableGlow={config.enableGlow ?? defaultProps.enableGlow}
        glowIntensity={config.glowIntensity ?? defaultProps.glowIntensity}
      />
    </div>
  );
};

/**
 * 根据批量配置生成图案配置
 */
function generateSymbolsFromBatch(batch: BatchGenerateConfig, globalSeed: number): SingleSymbolConfig[] {
  const random = createRandom(batch.seed ?? globalSeed);
  const symbols: SingleSymbolConfig[] = [];

  const {
    type,
    count,
    minX = 0,
    maxX = 100,
    minY = 0,
    maxY = 100,
    minScale = 0.5,
    maxScale = 1.5,
    minRotation = -30,
    maxRotation = 30,
    opacityRange = [0.6, 1],
    primaryColors,
    secondaryColors,
    enable3D = false,
    enableGlow = true,
    glowIntensityRange = [0.5, 1.5],
    animated = false,
  } = batch;

  for (let i = 0; i < count; i++) {
    // 获取颜色
    let primaryColor: string;
    let secondaryColor: string;

    if (Array.isArray(primaryColors)) {
      primaryColor = primaryColors[Math.floor(random() * primaryColors.length)];
    } else if (typeof primaryColors === "string") {
      primaryColor = primaryColors;
    } else {
      primaryColor = DEFAULT_PRIMARY_COLOR;
    }

    if (Array.isArray(secondaryColors)) {
      secondaryColor = secondaryColors[Math.floor(random() * secondaryColors.length)];
    } else if (typeof secondaryColors === "string") {
      secondaryColor = secondaryColors;
    } else {
      secondaryColor = DEFAULT_SECONDARY_COLOR;
    }

    symbols.push({
      type,
      x: minX + random() * (maxX - minX),
      y: minY + random() * (maxY - minY),
      scale: minScale + random() * (maxScale - minScale),
      rotation: minRotation + random() * (maxRotation - minRotation),
      opacity: opacityRange[0] + random() * (opacityRange[1] - opacityRange[0]),
      primaryColor,
      secondaryColor,
      enable3D,
      enableGlow,
      glowIntensity: glowIntensityRange[0] + random() * (glowIntensityRange[1] - glowIntensityRange[0]),
      animated,
      animationDelay: random() * 30,
    });
  }

  return symbols;
}

/**
 * 祝福图案生成组件
 * 
 * 用于生成金元宝、金币、福袋、莲花、寿桃等祝福相关的透明图案。
 * 支持单个性化配置和批量随机生成。
 * 
 * @example
 * // 基础用法：单个图案
 * <BlessingSymbol
 *   symbols={[
 *     { type: "goldIngot", x: 50, y: 50, scale: 1.5 }
 *   ]}
 * />
 * 
 * // 批量生成金币
 * <BlessingSymbol
 *   batchConfigs={[
 *     {
 *       type: "goldCoin",
 *       count: 20,
 *       minX: 10,
 *       maxX: 90,
 *       minY: 10,
 *       maxY: 90,
 *       primaryColors: ["#FFD700", "#FFA500"],
 *       enableGlow: true,
 *     }
 *   ]}
 * />
 * 
 * // 混合多种图案
 * <BlessingSymbol
 *   batchConfigs={[
 *     { type: "goldIngot", count: 5 },
 *     { type: "goldCoin", count: 15 },
 *     { type: "lotus", count: 3, primaryColor: "#FFB6C1" }
 *   ]}
 *   defaultEnableGlow
 *   animationSpeed={1}
 * />
 */
export const BlessingSymbol: React.FC<BlessingSymbolProps> = ({
  symbols = [],
  batchConfigs = [],
  defaultPrimaryColor = DEFAULT_PRIMARY_COLOR,
  defaultSecondaryColor = DEFAULT_SECONDARY_COLOR,
  defaultEnable3D = false,
  defaultEnableGlow = true,
  defaultGlowIntensity = 1,
  animationSpeed = 1,
}) => {
  // 合并所有图案配置
  const allSymbols = useMemo(() => {
    const result = [...symbols];
    let seedIndex = 0;
    
    batchConfigs.forEach((batch) => {
      const batchSymbols = generateSymbolsFromBatch(batch, seedIndex * 12345);
      result.push(...batchSymbols);
      seedIndex++;
    });

    return result;
  }, [symbols, batchConfigs]);

  const defaultProps = {
    primaryColor: defaultPrimaryColor,
    secondaryColor: defaultSecondaryColor,
    enable3D: defaultEnable3D,
    enableGlow: defaultEnableGlow,
    glowIntensity: defaultGlowIntensity,
    animated: animationSpeed > 0,
    animationSpeed,
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {allSymbols.map((symbol, index) => (
        <SingleSymbol key={index} config={symbol} defaultProps={defaultProps} />
      ))}
    </AbsoluteFill>
  );
};

export default BlessingSymbol;
