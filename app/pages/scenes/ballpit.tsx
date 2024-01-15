import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export const Ballpit = () => {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 0, 5],
      }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[-2, 2, 3]} intensity={1.5} castShadow />

      <OrbitControls />
      <mesh castShadow receiveShadow rotation={[0, 2, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </Canvas>
  );
};
