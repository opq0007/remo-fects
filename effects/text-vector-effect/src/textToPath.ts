/**
 * 文字转 SVG 路径工具
 * 
 * 使用浏览器原生 API 将文字转换为 SVG 路径坐标点
 * 支持中英文文字，提取轮廓轨迹点供动画使用
 */

/**
 * 路径点信息
 */
export interface PathPoint {
  x: number;
  y: number;
  /** 是否为轮廓起点（移动命令后的第一个点） */
  isStart?: boolean;
}

/**
 * 字符路径信息
 */
export interface CharPathInfo {
  char: string;
  points: PathPoint[];
  /** 边界框 */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * 文字路径配置
 */
export interface TextToPathConfig {
  /** 字体大小 */
  fontSize: number;
  /** 字体家族 */
  fontFamily: string;
  /** 字重 */
  fontWeight: number;
  /** 采样密度（每单位长度的采样点数） */
  sampleDensity: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: TextToPathConfig = {
  fontSize: 200,
  fontFamily: "Arial, sans-serif",
  fontWeight: 700,
  sampleDensity: 2, // 每 2 像素采样一个点
};

/**
 * 解析 SVG path d 属性中的命令
 */
function parsePathCommands(d: string): Array<{ command: string; values: number[] }> {
  const commands: Array<{ command: string; values: number[] }> = [];
  
  // 匹配所有命令和其参数
  const regex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;
  
  while ((match = regex.exec(d)) !== null) {
    const command = match[1];
    const paramsStr = match[2].trim();
    
    // 解析数值参数
    const values: number[] = [];
    if (paramsStr) {
      const numRegex = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
      let numMatch;
      while ((numMatch = numRegex.exec(paramsStr)) !== null) {
        values.push(parseFloat(numMatch[0]));
      }
    }
    
    commands.push({ command, values });
  }
  
  return commands;
}

/**
 * 从路径命令生成点
 */
function generatePointsFromCommands(
  commands: Array<{ command: string; values: number[] }>,
  sampleDensity: number
): PathPoint[] {
  const points: PathPoint[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let isFirstPoint = true;
  
  for (const { command, values } of commands) {
    switch (command) {
      case 'M': // 绝对移动
        currentX = values[0];
        currentY = values[1];
        startX = currentX;
        startY = currentY;
        points.push({ x: currentX, y: currentY, isStart: true });
        isFirstPoint = false;
        // M 命令后面可能跟着 L 命令的参数
        for (let i = 2; i < values.length; i += 2) {
          currentX = values[i];
          currentY = values[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
        
      case 'm': // 相对移动
        currentX += values[0];
        currentY += values[1];
        startX = currentX;
        startY = currentY;
        points.push({ x: currentX, y: currentY, isStart: true });
        isFirstPoint = false;
        for (let i = 2; i < values.length; i += 2) {
          currentX += values[i];
          currentY += values[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
        
      case 'L': // 绝对直线
        for (let i = 0; i < values.length; i += 2) {
          const targetX = values[i];
          const targetY = values[i + 1];
          // 在直线上采样点
          const dx = targetX - currentX;
          const dy = targetY - currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX + dx * t,
              y: currentY + dy * t,
            });
          }
          
          currentX = targetX;
          currentY = targetY;
        }
        break;
        
      case 'l': // 相对直线
        for (let i = 0; i < values.length; i += 2) {
          const dx = values[i];
          const dy = values[i + 1];
          const targetX = currentX + dx;
          const targetY = currentY + dy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX + dx * t,
              y: currentY + dy * t,
            });
          }
          
          currentX = targetX;
          currentY = targetY;
        }
        break;
        
      case 'H': // 绝对水平线
        for (const x of values) {
          const dx = x - currentX;
          const dist = Math.abs(dx);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX + dx * t,
              y: currentY,
            });
          }
          
          currentX = x;
        }
        break;
        
      case 'h': // 相对水平线
        for (const dx of values) {
          const targetX = currentX + dx;
          const dist = Math.abs(dx);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX + dx * t,
              y: currentY,
            });
          }
          
          currentX = targetX;
        }
        break;
        
      case 'V': // 绝对垂直线
        for (const y of values) {
          const dy = y - currentY;
          const dist = Math.abs(dy);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX,
              y: currentY + dy * t,
            });
          }
          
          currentY = y;
        }
        break;
        
      case 'v': // 相对垂直线
        for (const dy of values) {
          const targetY = currentY + dy;
          const dist = Math.abs(dy);
          const steps = Math.max(1, Math.floor(dist / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            points.push({
              x: currentX,
              y: currentY + dy * t,
            });
          }
          
          currentY = targetY;
        }
        break;
        
      case 'C': // 绝对三次贝塞尔曲线
        for (let i = 0; i < values.length; i += 6) {
          const cp1x = values[i];
          const cp1y = values[i + 1];
          const cp2x = values[i + 2];
          const cp2y = values[i + 3];
          const endX = values[i + 4];
          const endY = values[i + 5];
          
          // 估计曲线长度
          const approxLength = estimateCubicLength(
            currentX, currentY, cp1x, cp1y, cp2x, cp2y, endX, endY
          );
          const steps = Math.max(2, Math.floor(approxLength / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            const point = cubicBezierPoint(
              currentX, currentY, cp1x, cp1y, cp2x, cp2y, endX, endY, t
            );
            points.push(point);
          }
          
          currentX = endX;
          currentY = endY;
        }
        break;
        
      case 'c': // 相对三次贝塞尔曲线
        for (let i = 0; i < values.length; i += 6) {
          const cp1x = currentX + values[i];
          const cp1y = currentY + values[i + 1];
          const cp2x = currentX + values[i + 2];
          const cp2y = currentY + values[i + 3];
          const endX = currentX + values[i + 4];
          const endY = currentY + values[i + 5];
          
          const approxLength = estimateCubicLength(
            currentX, currentY, cp1x, cp1y, cp2x, cp2y, endX, endY
          );
          const steps = Math.max(2, Math.floor(approxLength / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            const point = cubicBezierPoint(
              currentX, currentY, cp1x, cp1y, cp2x, cp2y, endX, endY, t
            );
            points.push(point);
          }
          
          currentX = endX;
          currentY = endY;
        }
        break;
        
      case 'Q': // 绝对二次贝塞尔曲线
        for (let i = 0; i < values.length; i += 4) {
          const cpx = values[i];
          const cpy = values[i + 1];
          const endX = values[i + 2];
          const endY = values[i + 3];
          
          const approxLength = estimateQuadraticLength(
            currentX, currentY, cpx, cpy, endX, endY
          );
          const steps = Math.max(2, Math.floor(approxLength / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            const point = quadraticBezierPoint(
              currentX, currentY, cpx, cpy, endX, endY, t
            );
            points.push(point);
          }
          
          currentX = endX;
          currentY = endY;
        }
        break;
        
      case 'q': // 相对二次贝塞尔曲线
        for (let i = 0; i < values.length; i += 4) {
          const cpx = currentX + values[i];
          const cpy = currentY + values[i + 1];
          const endX = currentX + values[i + 2];
          const endY = currentY + values[i + 3];
          
          const approxLength = estimateQuadraticLength(
            currentX, currentY, cpx, cpy, endX, endY
          );
          const steps = Math.max(2, Math.floor(approxLength / sampleDensity));
          
          for (let j = 1; j <= steps; j++) {
            const t = j / steps;
            const point = quadraticBezierPoint(
              currentX, currentY, cpx, cpy, endX, endY, t
            );
            points.push(point);
          }
          
          currentX = endX;
          currentY = endY;
        }
        break;
        
      case 'A': // 绝对圆弧
        for (let i = 0; i < values.length; i += 7) {
          const rx = values[i];
          const ry = values[i + 1];
          const rotation = values[i + 2];
          const largeArc = values[i + 3];
          const sweep = values[i + 4];
          const endX = values[i + 5];
          const endY = values[i + 6];
          
          // 简化处理：将圆弧转为直线段采样
          const arcPoints = sampleArc(
            currentX, currentY, rx, ry, rotation, largeArc, sweep, endX, endY, sampleDensity
          );
          points.push(...arcPoints);
          
          currentX = endX;
          currentY = endY;
        }
        break;
        
      case 'Z':
      case 'z': // 闭合路径
        // 画一条线回到起点
        const dx = startX - currentX;
        const dy = startY - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / sampleDensity));
        
        for (let j = 1; j <= steps; j++) {
          const t = j / steps;
          points.push({
            x: currentX + dx * t,
            y: currentY + dy * t,
          });
        }
        
        currentX = startX;
        currentY = startY;
        break;
    }
  }
  
  return points;
}

/**
 * 计算三次贝塞尔曲线上的点
 */
function cubicBezierPoint(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  t: number
): PathPoint {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3,
    y: mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3,
  };
}

/**
 * 计算二次贝塞尔曲线上的点
 */
function quadraticBezierPoint(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  t: number
): PathPoint {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  
  return {
    x: mt2 * x0 + 2 * mt * t * x1 + t2 * x2,
    y: mt2 * y0 + 2 * mt * t * y1 + t2 * y2,
  };
}

/**
 * 估计三次贝塞尔曲线长度
 */
function estimateCubicLength(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
): number {
  // 使用控制点之间的距离作为近似
  const d1 = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  const d2 = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const d3 = Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2);
  return d1 + d2 + d3;
}

/**
 * 估计二次贝塞尔曲线长度
 */
function estimateQuadraticLength(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const d1 = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  const d2 = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return d1 + d2;
}

/**
 * 简化采样圆弧
 */
function sampleArc(
  x1: number, y1: number,
  rx: number, ry: number,
  rotation: number,
  largeArc: number,
  sweep: number,
  x2: number, y2: number,
  sampleDensity: number
): PathPoint[] {
  const points: PathPoint[] = [];
  
  // 简化处理：将圆弧近似为直线段
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  // 圆弧通常比直线长，乘以一个系数
  const arcLength = dist * Math.max(rx, ry) / Math.min(rx, ry || 1) * 1.5;
  const steps = Math.max(2, Math.floor(arcLength / sampleDensity));
  
  // 简化：使用直线插值，但应用一些弯曲效果
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // 添加一点弧度效果
    const bend = Math.sin(t * Math.PI) * Math.min(rx, ry) * 0.3;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // 垂直方向偏移
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    
    points.push({
      x: x1 + (x2 - x1) * t + nx * bend * (sweep ? 1 : -1),
      y: y1 + (y2 - y1) * t + ny * bend * (sweep ? 1 : -1),
    });
  }
  
  return points;
}

/**
 * 计算点集的边界框
 */
function calculateBounds(points: PathPoint[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 使用浏览器 API 将文字转换为 SVG 路径
 * 
 * 这个函数需要在浏览器环境中执行
 */
export function textToPath(text: string, config: Partial<TextToPathConfig> = {}): CharPathInfo[] {
  const { fontSize, fontFamily, fontWeight, sampleDensity } = { ...DEFAULT_CONFIG, ...config };
  
  const results: CharPathInfo[] = [];
  
  // 创建离屏 SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "1000");
  svg.setAttribute("height", "1000");
  svg.style.position = "absolute";
  svg.style.left = "-9999px";
  svg.style.top = "-9999px";
  
  // 创建文字元素
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.setAttribute("font-size", String(fontSize));
  textElement.setAttribute("font-family", fontFamily);
  textElement.setAttribute("font-weight", String(fontWeight));
  textElement.setAttribute("fill", "black");
  textElement.setAttribute("x", "0");
  textElement.setAttribute("y", String(fontSize));
  textElement.textContent = text;
  
  svg.appendChild(textElement);
  document.body.appendChild(svg);
  
  try {
    // 获取文本的边界框
    const bbox = textElement.getBBox();
    
    // 为每个字符单独创建路径
    let xOffset = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 创建单独的字符元素来获取路径
      const charSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      charSvg.setAttribute("width", "1000");
      charSvg.setAttribute("height", "1000");
      charSvg.style.position = "absolute";
      charSvg.style.left = "-9999px";
      charSvg.style.top = "-9999px";
      
      const charText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      charText.setAttribute("font-size", String(fontSize));
      charText.setAttribute("font-family", fontFamily);
      charText.setAttribute("font-weight", String(fontWeight));
      charText.setAttribute("fill", "black");
      charText.setAttribute("x", "0");
      charText.setAttribute("y", String(fontSize));
      charText.textContent = char;
      
      charSvg.appendChild(charText);
      document.body.appendChild(charSvg);
      
      try {
        // 获取字符的路径数据
        const charBbox = charText.getBBox();
        
        // 使用更精细的方法：将文字渲染到 canvas 然后提取轮廓
        // 但这里我们使用一个简化的方法：使用 path 数据
        // 由于浏览器不直接提供文字到路径的转换，我们使用另一种方法
        
        // 使用 measureText 和近似方法
        const charPoints = generateCharPointsApproximation(
          char,
          charBbox.x,
          charBbox.y,
          charBbox.width,
          charBbox.height,
          fontSize,
          sampleDensity
        );
        
        const bounds = calculateBounds(charPoints);
        
        results.push({
          char,
          points: charPoints,
          bounds,
        });
        
        xOffset += charBbox.width;
      } finally {
        document.body.removeChild(charSvg);
      }
    }
  } finally {
    document.body.removeChild(svg);
  }
  
  return results;
}

/**
 * 近似生成字符轮廓点
 * 
 * 由于浏览器不直接提供文字到路径的转换，这个函数使用简化的方法
 * 生成字符的近似轮廓点
 */
function generateCharPointsApproximation(
  char: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  sampleDensity: number
): PathPoint[] {
  const points: PathPoint[] = [];
  
  // 创建离屏 canvas 来检测字符轮廓
  const canvas = document.createElement("canvas");
  const padding = 5;
  canvas.width = Math.ceil(width + padding * 2);
  canvas.height = Math.ceil(height + padding * 2);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return points;
  
  // 绘制字符
  ctx.fillStyle = "black";
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(char, padding, padding);
  
  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 边缘检测：找到所有非透明像素的边缘点
  const edgePoints: Array<{ x: number; y: number }> = [];
  
  for (let py = 1; py < canvas.height - 1; py++) {
    for (let px = 1; px < canvas.width - 1; px++) {
      const idx = (py * canvas.width + px) * 4;
      const alpha = data[idx + 3];
      
      // 如果当前像素有颜色
      if (alpha > 128) {
        // 检查是否是边缘像素（相邻有透明像素）
        const neighbors = [
          data[((py - 1) * canvas.width + px) * 4 + 3], // 上
          data[((py + 1) * canvas.width + px) * 4 + 3], // 下
          data[(py * canvas.width + px - 1) * 4 + 3], // 左
          data[(py * canvas.width + px + 1) * 4 + 3], // 右
        ];
        
        const isEdge = neighbors.some(n => n < 128);
        
        if (isEdge) {
          edgePoints.push({
            x: x + px - padding,
            y: y + py - padding,
          });
        }
      }
    }
  }
  
  // 对边缘点进行排序，形成连续的轮廓
  // 使用简化的方法：按角度排序
  if (edgePoints.length > 0) {
    const centerX = edgePoints.reduce((sum, p) => sum + p.x, 0) / edgePoints.length;
    const centerY = edgePoints.reduce((sum, p) => sum + p.y, 0) / edgePoints.length;
    
    // 按角度排序
    edgePoints.sort((a, b) => {
      const angleA = Math.atan2(a.y - centerY, a.x - centerX);
      const angleB = Math.atan2(b.y - centerY, b.x - centerX);
      return angleA - angleB;
    });
    
    // 按密度采样
    const step = Math.max(1, Math.floor(sampleDensity / 2));
    for (let i = 0; i < edgePoints.length; i += step) {
      points.push({
        x: edgePoints[i].x,
        y: edgePoints[i].y,
        isStart: i === 0,
      });
    }
  }
  
  return points;
}

/**
 * 将文字转换为填充点
 * 
 * 不仅返回边缘点，还返回内部的填充点
 */
export function textToFillPoints(
  text: string,
  config: Partial<TextToPathConfig> = {}
): PathPoint[] {
  const { fontSize, fontFamily, fontWeight, sampleDensity } = { ...DEFAULT_CONFIG, ...config };
  
  const allPoints: PathPoint[] = [];
  
  // 创建离屏 canvas
  const canvas = document.createElement("canvas");
  const padding = 10;
  canvas.width = Math.ceil(fontSize * text.length * 1.2 + padding * 2);
  canvas.height = Math.ceil(fontSize * 1.5 + padding * 2);
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return allPoints;
  
  // 绘制文字
  ctx.fillStyle = "black";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, padding, canvas.height / 2);
  
  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 找到文字的边界
  let minX = canvas.width;
  let maxX = 0;
  let minY = canvas.height;
  let maxY = 0;
  
  for (let py = 0; py < canvas.height; py++) {
    for (let px = 0; px < canvas.width; px++) {
      const idx = (py * canvas.width + px) * 4;
      if (data[idx + 3] > 128) {
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
      }
    }
  }
  
  // 在边界内按密度采样点
  const step = sampleDensity;
  for (let py = minY; py <= maxY; py += step) {
    for (let px = minX; px <= maxX; px += step) {
      const idx = (py * canvas.width + px) * 4;
      if (data[idx + 3] > 128) {
        allPoints.push({
          x: px - padding,
          y: py - canvas.height / 2,
        });
      }
    }
  }
  
  return allPoints;
}

/**
 * 对路径点进行采样和均匀分布
 * 
 * @param points 原始路径点
 * @param targetCount 目标点数
 * @returns 均匀分布的点
 */
export function sampleAndDistributePoints(
  points: PathPoint[],
  targetCount: number
): PathPoint[] {
  if (points.length === 0 || targetCount <= 0) return [];
  if (points.length <= targetCount) return points;
  
  const result: PathPoint[] = [];
  const step = points.length / targetCount;
  
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.floor(i * step);
    result.push(points[Math.min(idx, points.length - 1)]);
  }
  
  return result;
}

/**
 * 归一化点坐标到以中心为原点
 */
export function normalizePoints(points: PathPoint[]): { points: PathPoint[]; bounds: { width: number; height: number } } {
  if (points.length === 0) {
    return { points: [], bounds: { width: 0, height: 0 } };
  }
  
  const bounds = calculateBounds(points);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  
  const normalizedPoints = points.map(p => ({
    ...p,
    x: p.x - centerX,
    y: p.y - centerY,
  }));
  
  return {
    points: normalizedPoints,
    bounds: {
      width: bounds.width,
      height: bounds.height,
    },
  };
}
