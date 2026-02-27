import { Composition } from "remotion";
import { TextGrowExplodeComposition, TextGrowExplodeCompositionSchema } from "./TextGrowExplodeComposition";

function generateDefaultContourPoints(width: number, height: number) {
  const points: Array<{ x: number; y: number; opacity: number }> = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.42;

  const totalPoints = 16;
  const angleStep = (Math.PI * 2) / totalPoints;
  
  for (let i = 0; i < totalPoints; i++) {
    const angle = angleStep * i;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push({ x: Math.round(x), y: Math.round(y), opacity: 0.9 });
  }

  points.push({ x: centerX, y: centerY, opacity: 1 });

  return points;
}

const defaultContourPoints = generateDefaultContourPoints(720, 1280);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TextGrowExplode"
        component={TextGrowExplodeComposition}
        durationInFrames={240}
        fps={24}
        width={720}
        height={1280}
        schema={TextGrowExplodeCompositionSchema}
        defaultProps={{
          name: "张三丰",
          words: ["幸福", "健康", "快乐", "成长", "发财", "暴富", "幸运"],
          imageSource: "福字.png",
          contourPointsData: defaultContourPoints,
          growDuration: 90,
          holdDuration: 30,
          explodeDuration: 30,
          fallDuration: 90,
          fontSize: 24,
          particleFontSize: 36,
          textColor: "#ffd700",
          glowColor: "#ffaa00",
          glowIntensity: 1,
          particleCount: 80,
          gravity: 0.15,
          wind: 0,
          threshold: 128,
          sampleDensity: 6,
          growStyle: "tree",
          backgroundColor: "#0a0a1a",
          backgroundOpacity: 0.9,
          explodeBackgroundOpacity: 0.4,
          seed: 42,
          overlayColor: "#000000",
          overlayOpacity: 0.15,
        }}
      />
    </>
  );
};
