import { Composition } from "remotion";
import { TaiChiBaguaComposition, TaiChiBaguaSchema } from "./TaiChiBaguaComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TaiChiBagua"
        component={TaiChiBaguaComposition}
        durationInFrames={240}
        fps={24}
        width={720}
        height={1280}
        schema={TaiChiBaguaSchema}
        defaultProps={{
          yangColor: "#FFD700",
          yinColor: "#1a1a1a",
          backgroundColor: "#000000",
          glowIntensity: 1,
          taichiRotationSpeed: 1,
          baguaRotationSpeed: 0.8,
          taichiSize: 180,
          baguaRadius: 200,
          showLabels: true,
          showParticles: true,
          showEnergyField: true,
          labelOffset: 45,
          particleCount: 40,
          particleSpeed: 2,
          viewAngle: 25,
          perspectiveDistance: 1000,
          // 新增参数默认值
          verticalPosition: 0.95,
          enable3D: false,
          depth3D: 15,
          enableGoldenSparkle: true,
          sparkleDensity: 30,
          enableMysticalAura: true,
          auraIntensity: 0.6,
        }}
      />
    </>
  );
};