import { Composition } from "remotion";
import { TaiChiBaguaComposition, TaiChiBaguaSchema } from "./TaiChiBaguaComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TaiChiBagua"
        component={TaiChiBaguaComposition}
        durationInFrames={480}
        fps={24}
        width={720}
        height={1280}
        schema={TaiChiBaguaSchema}
        defaultProps={{
          yangColor: "#FFD700",
          yinColor: "#1a1a1a",
          backgroundColor: "#FFFFFF",
          backgroundType: "color",
          backgroundVideoLoop: true,
          backgroundVideoMuted: true,
          glowIntensity: 0.9,
          taichiRotationSpeed: 1,
          baguaRotationSpeed: 0.8,
          taichiSize: 200,
          baguaRadius: 280,
          showLabels: true,
          showParticles: true,
          showEnergyField: true,
          labelOffset: 45,
          particleCount: 40,
          particleSpeed: 1,
          viewAngle: 30,
          perspectiveDistance: 800,
          verticalPosition: 0.5,
          verticalMargin: 50,
          enable3D: false,
          depth3D: 15,
          enableGoldenSparkle: true,
          sparkleDensity: 30,
          enableMysticalAura: true,
          auraIntensity: 0.6,
          overlayColor: "#000000",
          overlayOpacity: 0,
        }}
      />
    </>
  );
};
