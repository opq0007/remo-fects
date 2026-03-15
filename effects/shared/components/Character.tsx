import React from 'react';
import { 
  AbsoluteFill, 
  useCurrentFrame, 
  useVideoConfig,
  interpolate,
  spring,
  random,
  staticFile
} from 'remotion';
import { 
  CharacterConfig, 
  CharacterSeries,
  ZodiacType,
  PetType,
  HeroType
} from '../types/character';
import { 
  ZODIAC_CHARACTERS,
  PET_CHARACTERS,
  HERO_CHARACTERS
} from '../types/colors';

// ==================== 角色SVG定义 ====================

// 生肖角色 SVG
const ZodiacCharacterSVG: React.FC<{
  type: ZodiacType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
  expression: 'happy' | 'excited' | 'waving' | 'hugging';
}> = ({ type, primaryColor, secondaryColor, accentColor, size, expression }) => {
  const eyeGlow = expression === 'excited' ? '0 0 10px #fff' : '0 0 5px #fff';
  const eyeSize = expression === 'excited' ? 5 : 4;
  
  const mouthPath = expression === 'happy' 
    ? 'M -8 5 Q 0 12 8 5' 
    : expression === 'excited' 
    ? 'M -10 3 Q 0 15 10 3'
    : 'M -6 4 Q 0 8 6 4';
  
  const renderBaseCharacter = () => (
    <g>
      {/* 身体 */}
      <ellipse cx="0" cy="60" rx="45" ry="50" fill={primaryColor} />
      
      {/* 头部（大头比例） */}
      <circle cx="0" cy="-10" r="55" fill={primaryColor} />
      
      {/* 脸颊红晕 */}
      <ellipse cx="-30" cy="5" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="30" cy="5" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
      
      {/* 眼睛（大且发光） */}
      <g>
        <ellipse cx="-18" cy="-5" rx="12" ry="14" fill="white" />
        <ellipse cx="18" cy="-5" rx="12" ry="14" fill="white" />
        <circle cx="-18" cy="-3" r={eyeSize} fill="#333" style={{ filter: eyeGlow }} />
        <circle cx="18" cy="-3" r={eyeSize} fill="#333" style={{ filter: eyeGlow }} />
        {/* 眼睛高光 */}
        <circle cx="-15" cy="-6" r="3" fill="white" />
        <circle cx="21" cy="-6" r="3" fill="white" />
      </g>
      
      {/* 鼻子 */}
      <ellipse cx="0" cy="12" rx="6" ry="4" fill={secondaryColor} />
      
      {/* 嘴巴 */}
      <path d={mouthPath} stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
  
  const renderZodiacFeatures = () => {
    switch (type) {
      case 'rat':
        return (
          <g>
            {/* 老鼠耳朵 */}
            <ellipse cx="-40" cy="-50" rx="20" ry="25" fill={primaryColor} />
            <ellipse cx="-40" cy="-50" rx="12" ry="15" fill="#FFB6C1" />
            <ellipse cx="40" cy="-50" rx="20" ry="25" fill={primaryColor} />
            <ellipse cx="40" cy="-50" rx="12" ry="15" fill="#FFB6C1" />
            {/* 胡须 */}
            <line x1="-25" y1="10" x2="-50" y2="5" stroke="#333" strokeWidth="1" />
            <line x1="-25" y1="15" x2="-50" y2="18" stroke="#333" strokeWidth="1" />
            <line x1="25" y1="10" x2="50" y2="5" stroke="#333" strokeWidth="1" />
            <line x1="25" y1="15" x2="50" y2="18" stroke="#333" strokeWidth="1" />
          </g>
        );
      case 'tiger':
        return (
          <g>
            {/* 老虎耳朵 */}
            <circle cx="-40" cy="-55" r="18" fill={primaryColor} />
            <circle cx="40" cy="-55" r="18" fill={primaryColor} />
            <circle cx="-40" cy="-55" r="10" fill="#FFB6C1" />
            <circle cx="40" cy="-55" r="10" fill="#FFB6C1" />
            {/* 虎纹 */}
            <path d="M -30 -40 Q -25 -30 -30 -20" stroke="#333" strokeWidth="4" fill="none" />
            <path d="M 30 -40 Q 25 -30 30 -20" stroke="#333" strokeWidth="4" fill="none" />
            <path d="M -5 -55 L -5 -45" stroke="#333" strokeWidth="4" />
            <path d="M 5 -55 L 5 -45" stroke="#333" strokeWidth="4" />
          </g>
        );
      case 'rabbit':
        return (
          <g>
            {/* 兔子长耳朵 */}
            <ellipse cx="-20" cy="-90" rx="15" ry="40" fill={primaryColor} />
            <ellipse cx="-20" cy="-90" rx="8" ry="30" fill="#FFB6C1" />
            <ellipse cx="20" cy="-90" rx="15" ry="40" fill={primaryColor} />
            <ellipse cx="20" cy="-90" rx="8" ry="30" fill="#FFB6C1" />
          </g>
        );
      case 'dragon':
        return (
          <g>
            {/* 龙角 */}
            <path d="M -30 -60 L -35 -85 L -20 -70 Z" fill={accentColor} />
            <path d="M 30 -60 L 35 -85 L 20 -70 Z" fill={accentColor} />
            {/* 龙鳞 */}
            <circle cx="-25" cy="-30" r="5" fill={accentColor} opacity="0.5" />
            <circle cx="25" cy="-30" r="5" fill={accentColor} opacity="0.5" />
            <circle cx="0" cy="-45" r="5" fill={accentColor} opacity="0.5" />
          </g>
        );
      default:
        // 默认圆耳朵
        return (
          <g>
            <circle cx="-45" cy="-45" r="18" fill={primaryColor} />
            <circle cx="45" cy="-45" r="18" fill={primaryColor} />
          </g>
        );
    }
  };
  
  const renderHands = () => {
    if (expression === 'waving') {
      return (
        <g>
          {/* 挥手的右手 */}
          <ellipse cx="55" cy="40" rx="15" ry="12" fill={primaryColor} 
            style={{ transform: 'rotate(-20deg)', transformOrigin: '55px 40px' }} />
          {/* 手指 */}
          <circle cx="60" cy="28" r="5" fill={primaryColor} />
          <circle cx="68" cy="32" r="5" fill={primaryColor} />
          <circle cx="72" cy="40" r="5" fill={primaryColor} />
          {/* 左手 */}
          <ellipse cx="-55" cy="50" rx="15" ry="12" fill={primaryColor} />
        </g>
      );
    }
    if (expression === 'hugging') {
      return (
        <g>
          {/* 拥抱姿势 */}
          <ellipse cx="40" cy="30" rx="15" ry="12" fill={primaryColor} 
            style={{ transform: 'rotate(30deg)' }} />
          <ellipse cx="-40" cy="30" rx="15" ry="12" fill={primaryColor} 
            style={{ 'rotate': '-30deg' } as React.CSSProperties} />
        </g>
      );
    }
    return (
      <g>
        <ellipse cx="-50" cy="50" rx="15" ry="12" fill={primaryColor} />
        <ellipse cx="50" cy="50" rx="15" ry="12" fill={primaryColor} />
      </g>
    );
  };
  
  return (
    <svg width={size} height={size * 1.3} viewBox="-80 -100 160 180">
      {renderBaseCharacter()}
      {renderZodiacFeatures()}
      {renderHands()}
    </svg>
  );
};

// 萌宠精灵 SVG
const PetCharacterSVG: React.FC<{
  type: PetType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
  expression: 'happy' | 'excited' | 'waving' | 'hugging';
}> = ({ type, primaryColor, secondaryColor, accentColor, size, expression }) => {
  const eyeGlow = expression === 'excited' ? '0 0 12px #fff' : '0 0 6px #fff';
  
  const renderBasePet = () => (
    <g>
      {/* 身体（更圆润） */}
      <ellipse cx="0" cy="55" rx="50" ry="45" fill={primaryColor} />
      
      {/* 头部（超大头比例） */}
      <circle cx="0" cy="-15" r="60" fill={primaryColor} />
      
      {/* 腮红 */}
      <ellipse cx="-35" cy="0" rx="15" ry="10" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="35" cy="0" rx="15" ry="10" fill="#FFB6C1" opacity="0.5" />
      
      {/* 大眼睛 */}
      <ellipse cx="-20" cy="-10" rx="15" ry="18" fill="white" />
      <ellipse cx="20" cy="-10" rx="15" ry="18" fill="white" />
      <circle cx="-20" cy="-8" r="8" fill="#333" style={{ filter: eyeGlow }} />
      <circle cx="20" cy="-8" r="8" fill="#333" style={{ filter: eyeGlow }} />
      <circle cx="-17" cy="-12" r="4" fill="white" />
      <circle cx="23" cy="-12" r="4" fill="white" />
      
      {/* 小鼻子 */}
      <ellipse cx="0" cy="10" rx="8" ry="5" fill={secondaryColor} />
      
      {/* 微笑 */}
      <path d="M -12 18 Q 0 28 12 18" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
  
  const renderPetFeatures = () => {
    switch (type) {
      case 'bunny':
        return (
          <g>
            {/* 兔耳朵 */}
            <ellipse cx="-25" cy="-95" rx="18" ry="45" fill={primaryColor} />
            <ellipse cx="-25" cy="-95" rx="10" ry="35" fill="#FFB6C1" />
            <ellipse cx="25" cy="-95" rx="18" ry="45" fill={primaryColor} />
            <ellipse cx="25" cy="-95" rx="10" ry="35" fill="#FFB6C1" />
          </g>
        );
      case 'kitten':
        return (
          <g>
            {/* 猫耳朵（三角形） */}
            <path d="M -45 -60 L -55 -95 L -25 -70 Z" fill={primaryColor} />
            <path d="M 45 -60 L 55 -95 L 25 -70 Z" fill={primaryColor} />
            <path d="M -40 -65 L -48 -90 L -28 -72 Z" fill="#FFB6C1" />
            <path d="M 40 -65 L 48 -90 L 28 -72 Z" fill="#FFB6C1" />
          </g>
        );
      case 'puppy':
        return (
          <g>
            {/* 狗耳朵（下垂） */}
            <ellipse cx="-50" cy="-30" rx="20" ry="35" fill={primaryColor} />
            <ellipse cx="50" cy="-30" rx="20" ry="35" fill={primaryColor} />
          </g>
        );
      case 'bear':
        return (
          <g>
            {/* 熊耳朵（圆圆的） */}
            <circle cx="-40" cy="-65" r="20" fill={primaryColor} />
            <circle cx="40" cy="-65" r="20" fill={primaryColor} />
            <circle cx="-40" cy="-65" r="12" fill={secondaryColor} />
            <circle cx="40" cy="-65" r="12" fill={secondaryColor} />
          </g>
        );
      default:
        return null;
    }
  };
  
  return (
    <svg width={size} height={size * 1.4} viewBox="-90 -110 180 170">
      {renderBasePet()}
      {renderPetFeatures()}
    </svg>
  );
};

// 勇气超人 SVG
const HeroCharacterSVG: React.FC<{
  type: HeroType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  size: number;
  expression: 'happy' | 'excited' | 'waving' | 'hugging';
}> = ({ type, primaryColor, secondaryColor, accentColor, size, expression }) => {
  const eyeGlow = '0 0 15px #fff';
  
  const renderBaseHero = () => (
    <g>
      {/* 披风 */}
      <path d="M -50 20 Q -70 80 -40 120 L 0 100 L 40 120 Q 70 80 50 20 Z" 
        fill={accentColor} opacity="0.8" />
      
      {/* 身体 */}
      <rect x="-35" y="20" width="70" height="60" rx="15" fill={primaryColor} />
      
      {/* 胸口标志 */}
      <circle cx="0" cy="45" r="15" fill={secondaryColor} />
      <text x="0" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill={primaryColor}>★</text>
      
      {/* 头部 */}
      <circle cx="0" cy="-15" r="50" fill={primaryColor} />
      
      {/* 面罩 */}
      <path d="M -40 -25 Q 0 -40 40 -25 L 40 -10 Q 0 5 -40 -10 Z" fill={accentColor} opacity="0.9" />
      
      {/* 眼睛（发光效果更强） */}
      <ellipse cx="-15" cy="-10" rx="12" ry="8" fill="white" />
      <ellipse cx="15" cy="-10" rx="12" ry="8" fill="white" />
      <circle cx="-15" cy="-10" r="5" fill="#333" style={{ filter: eyeGlow }} />
      <circle cx="15" cy="-10" r="5" fill="#333" style={{ filter: eyeGlow }} />
      
      {/* 自信的微笑 */}
      <path d="M -10 15 Q 0 25 10 15" stroke="#333" strokeWidth="2" fill="none" />
    </g>
  );
  
  const renderHeroFeatures = () => {
    switch (type) {
      case 'superhero':
        return (
          <g>
            {/* 头盔 */}
            <path d="M -45 -50 Q 0 -80 45 -50" fill={accentColor} />
            {/* 手臂（强壮） */}
            <rect x="-55" y="25" width="20" height="40" rx="8" fill={primaryColor} />
            <rect x="35" y="25" width="20" height="40" rx="8" fill={primaryColor} />
          </g>
        );
      case 'astronaut':
        return (
          <g>
            {/* 头盔玻璃罩 */}
            <circle cx="0" cy="-15" r="45" fill="rgba(200,230,255,0.3)" stroke="#7EC8FF" strokeWidth="3" />
            {/* 天线 */}
            <line x1="-20" y1="-65" x2="-20" y2="-80" stroke="#7EC8FF" strokeWidth="3" />
            <circle cx="-20" cy="-85" r="5" fill="#FF6B6B" />
            <line x1="20" y1="-65" x2="20" y2="-80" stroke="#7EC8FF" strokeWidth="3" />
            <circle cx="20" cy="-85" r="5" fill="#82E6C5" />
          </g>
        );
      case 'wizard':
        return (
          <g>
            {/* 巫师帽 */}
            <path d="M -45 -50 L 0 -100 L 45 -50 Q 0 -60 -45 -50" fill={accentColor} />
            <circle cx="10" cy="-55" r="8" fill={secondaryColor} />
            {/* 星星装饰 */}
            <text x="-20" y="-70" fontSize="12" fill={secondaryColor}>✨</text>
          </g>
        );
      default:
        return null;
    }
  };
  
  return (
    <svg width={size} height={size * 1.5} viewBox="-80 -100 160 150">
      {renderBaseHero()}
      {renderHeroFeatures()}
    </svg>
  );
};

// ==================== 辅助函数 ====================

// image 系列的默认配置
const IMAGE_CHARACTER_DEFAULT_CONFIG: CharacterConfig = {
  series: 'image',
  type: 'tiger', // 占位值，image 模式下不使用
  name: '自定义角色',
  greeting: '你好！',
  primaryColor: '#FFD76A',
  secondaryColor: '#7EC8FF',
  accentColor: '#FF8FA3',
};

export const getCharacterConfig = (
  series: CharacterSeries, 
  type?: ZodiacType | PetType | HeroType
): CharacterConfig => {
  switch (series) {
    case 'image':
      return IMAGE_CHARACTER_DEFAULT_CONFIG;
    case 'zodiac':
      return ZODIAC_CHARACTERS[type as ZodiacType] || ZODIAC_CHARACTERS.tiger;
    case 'pet':
      return PET_CHARACTERS[type as PetType] || PET_CHARACTERS.bunny;
    case 'hero':
      return HERO_CHARACTERS[type as HeroType] || HERO_CHARACTERS.superhero;
    default:
      return ZODIAC_CHARACTERS.tiger;
  }
};

// ==================== 主角色组件 ====================

interface CharacterProps {
  series: CharacterSeries;
  /** 角色类型，image 模式下可忽略 */
  type?: ZodiacType | PetType | HeroType;
  size?: number;
  /** 表情，image 模式下可忽略 */
  expression?: 'happy' | 'excited' | 'waving' | 'hugging';
  position?: 'center' | 'left' | 'right';
  animate?: boolean;
  customConfig?: Partial<CharacterConfig>;
  /** 是否使用内联布局（由父容器控制位置），默认 false */
  inline?: boolean;
  /** 图片资源路径（本地路径或网络URL），仅当 series='image' 时使用 */
  imageSrc?: string;
  /** 图片宽度（仅 image 模式），不设置则使用 size 参数 */
  imageWidth?: number;
  /** 图片高度（仅 image 模式），不设置则使用 size * 1.5 */
  imageHeight?: number;
}

export const Character: React.FC<CharacterProps> = ({
  series,
  type,
  size = 200,
  expression = 'happy',
  position = 'center',
  animate = true,
  customConfig,
  inline = false,
  imageSrc,
  imageWidth,
  imageHeight
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // 获取角色配置
  const config = { ...getCharacterConfig(series, type), ...customConfig };
  
  // 入场动画
  const entrance = animate ? spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 }
  }) : 1;
  
  // 浮动动画
  const floatY = animate ? Math.sin(frame * 0.05) * 8 : 0;
  const floatRotation = animate ? Math.sin(frame * 0.03) * 3 : 0;
  
  // 呼吸效果
  const breathe = 1 + Math.sin(frame * 0.08) * 0.02;
  
  // 表情切换动画（仅对非 image 模式生效）
  const expressionScale = expression === 'excited' 
    ? 1 + Math.sin(frame * 0.3) * 0.05 
    : 1;
  
  // 内联模式样式（由父容器控制位置）
  const getInlineStyle = (): React.CSSProperties => {
    return {
      transform: `translateY(${floatY}px) scale(${entrance * breathe * expressionScale}) rotate(${floatRotation}deg)`,
      zIndex: 10,
    };
  };
  
  // 绝对定位样式
  const getPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: '15%',
      transform: `translateX(-50%) translateY(${floatY}px) scale(${entrance * breathe * expressionScale}) rotate(${floatRotation}deg)`,
      zIndex: 10,
    };
    
    switch (position) {
      case 'left':
        return { ...baseStyle, left: '25%' };
      case 'right':
        return { ...baseStyle, left: '75%' };
      default:
        return { ...baseStyle, left: '50%' };
    }
  };
  
  // 渲染图片角色（image 模式）
  const renderImageCharacter = () => {
    // 计算图片尺寸，优先使用自定义尺寸，否则使用默认值
    const imgWidth = imageWidth ?? size;
    const imgHeight = imageHeight ?? size * 1.5;
    
    if (!imageSrc) {
      return (
        <div style={{
          width: imgWidth,
          height: imgHeight,
          backgroundColor: '#f0f0f0',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#999',
        }}>
          未指定图片
        </div>
      );
    }
    
    // 判断是否为网络 URL
    const isNetworkUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');
    // 判断是否为 base64 数据
    const isBase64 = imageSrc.startsWith('data:');
    // 本地文件路径使用 staticFile 包装
    const imageSource = (isNetworkUrl || isBase64) ? imageSrc : staticFile(imageSrc);
    
    return (
      <img 
        src={imageSource} 
        alt="角色图片"
        style={{
          width: imgWidth,
          height: imgHeight,
          objectFit: 'contain',
        }}
      />
    );
  };
  
  // 渲染角色SVG
  const renderCharacterSVG = () => {
    const props = {
      type: type as ZodiacType & PetType & HeroType,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      accentColor: config.accentColor,
      size,
      expression
    };
    
    switch (series) {
      case 'image':
        return renderImageCharacter();
      case 'zodiac':
        return <ZodiacCharacterSVG {...props} type={type as ZodiacType} />;
      case 'pet':
        return <PetCharacterSVG {...props} type={type as PetType} />;
      case 'hero':
        return <HeroCharacterSVG {...props} type={type as HeroType} />;
      default:
        return <ZodiacCharacterSVG {...props} type="tiger" />;
    }
  };
  
  return (
    <div style={inline ? getInlineStyle() : getPositionStyle()}>
      <div style={{
        filter: `drop-shadow(0 10px 20px rgba(0,0,0,0.2)) drop-shadow(0 0 30px ${config.primaryColor}40)`,
      }}>
        {renderCharacterSVG()}
      </div>
    </div>
  );
};

// ==================== 角色说话气泡 ====================

interface SpeechBubbleProps {
  text: string;
  visible?: boolean;
  position?: 'top' | 'right' | 'left';
  color?: string;
  textColor?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  visible = true,
  position = 'top',
  color = '#FFFFFF',
  textColor = '#333'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // 弹入动画
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 }
  });
  
  // 轻微摇晃
  const wobble = Math.sin(frame * 0.1) * 1.5;
  
  if (!visible) return null;
  
  const getPositionStyle = (): React.CSSProperties => {
    switch (position) {
      case 'right':
        return { left: '100%', top: '25%', marginLeft: '15px' };
      case 'left':
        return { right: '100%', top: '25%', marginRight: '15px' };
      default:
        return { marginBottom: '10px' };
    }
  };
  
  return (
    <div style={{
      position: 'relative',
      ...getPositionStyle(),
      backgroundColor: color,
      padding: '16px 24px',
      borderRadius: '20px',
      boxShadow: `
        0 4px 15px rgba(0,0,0,0.1),
        0 8px 30px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.8)
      `,
      transform: `scale(${scale}) rotate(${wobble}deg)`,
      maxWidth: '320px',
      minWidth: '180px',
      zIndex: 20,
    }}>
      <span style={{
        fontSize: '20px',
        fontWeight: 600,
        color: textColor,
        whiteSpace: 'pre-wrap',
        textAlign: 'center',
        display: 'block',
        fontFamily: '"Comic Sans MS", "PingFang SC", cursive',
        lineHeight: 1.5,
      }}>
        {text}
      </span>
      {/* 气泡尖角 - 指向角色 */}
      {position === 'top' && (
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `10px solid ${color}`,
        }} />
      )}
    </div>
  );
};

// ==================== 完整角色组件（带对话） ====================

interface CharacterWithSpeechProps extends CharacterProps {
  speech?: string;
  showSpeech?: boolean;
}

export const CharacterWithSpeech: React.FC<CharacterWithSpeechProps> = ({
  speech,
  showSpeech = false,
  ...characterProps
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {speech && showSpeech && <SpeechBubble text={speech} />}
      <Character {...characterProps} />
    </div>
  );
};

export default Character;
