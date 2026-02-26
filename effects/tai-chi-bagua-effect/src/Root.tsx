import { Composition } from "remotion";
import { TaiChiBaguaComposition, TaiChiBaguaSchema } from "./TaiChiBaguaComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TaiChiBagua"
        component={TaiChiBaguaComposition}
        durationInFrames={300}
        fps={30}
        width={720}
        height={720}
        schema={TaiChiBaguaSchema}
        defaultProps={{
          yangColor: "#FFD700",
          yinColor: "#1a1a1a",
          backgroundColor: "#FFFFFF",
          glowIntensity: 0.9,
          taichiRotationSpeed: 1,
          baguaRotationSpeed: 0.5,
          taichiSize: 200,
          baguaRadius: 280,
          showLabels: true,
          showParticles: true,
          showEnergyField: true,
          labelOffset: 45,
          particleCount: 40,
          particleSpeed: 1,
        }}
      />
    </>
  );
};
