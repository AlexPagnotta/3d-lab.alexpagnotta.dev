import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  Physics,
  type RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { getRandomNumber } from "~/features/utils/random";

const SPHERES_COUNT = 40;
const SPHERE_RADIUS = 1;
const SPHERES_GAP = SPHERE_RADIUS * 2;

const PANELS_GAP = SPHERE_RADIUS * 2 + 0.3;
const PANELS_THICKNESS = 2;
const PANELS_DEPTH = PANELS_GAP;

const PANELS_OFFSET = SPHERES_GAP * SPHERES_COUNT; // How much the panels are offseted from the viewport edge in height

const Container = () => {
  const { width: viewportWidth, height: viewportHeight } = useThree((state) => state.viewport);

  const panelsWidth = viewportWidth;
  const panelsHeight = viewportHeight + PANELS_OFFSET;

  return (
    <RigidBody type="fixed" colliders={false} position={[0, -viewportHeight / 2, 0]}>
      {/* Bottom */}
      <CuboidCollider
        scale={0.5}
        args={[panelsWidth + PANELS_THICKNESS * 2, PANELS_THICKNESS, PANELS_DEPTH]}
        position={[0, -PANELS_THICKNESS / 2, 0]}
      />

      {/* Top */}
      <CuboidCollider
        scale={0.5}
        args={[panelsWidth + PANELS_THICKNESS * 2, PANELS_THICKNESS, PANELS_DEPTH]}
        position={[0, panelsHeight + PANELS_THICKNESS / 2, 0]}
      />

      {/* Left */}
      <CuboidCollider
        scale={0.5}
        args={[PANELS_THICKNESS, panelsHeight, PANELS_DEPTH]}
        position={[-(panelsWidth / 2) - PANELS_THICKNESS / 2, panelsHeight / 2, 0]}
      />

      {/* Right */}
      <CuboidCollider
        scale={0.5}
        args={[PANELS_THICKNESS, panelsHeight, PANELS_DEPTH]}
        position={[panelsWidth / 2 + PANELS_THICKNESS / 2, panelsHeight / 2, 0]}
      />

      {/* Back */}
      <CuboidCollider
        scale={0.5}
        args={[panelsWidth + PANELS_THICKNESS * 2, panelsHeight, PANELS_THICKNESS]}
        position={[0, panelsHeight / 2, -PANELS_DEPTH / 2 - PANELS_THICKNESS / 2]}
      />

      {/* Front */}
      <CuboidCollider
        scale={0.5}
        args={[panelsWidth + PANELS_THICKNESS * 2, panelsHeight, PANELS_THICKNESS]}
        position={[0, panelsHeight / 2, PANELS_DEPTH / 2 + PANELS_THICKNESS / 2]}
      />
    </RigidBody>
  );
};

const Spheres = ({ isCameraReady }: { isCameraReady: boolean }) => {
  const { enabled: animationEnabled, restitution } = useControls("Debug", {
    enabled: true,
    restitution: {
      min: 0,
      max: 1,
      value: 0.5,
      step: 0.1,
    },
  });

  const { height: viewportHeight, width: viewportWidth } = useThree((state) => state.viewport);

  const spheresRef = useRef<RapierRigidBody[]>(null);

  // Set viewport size when camera is ready
  // Needed cause on first rerender the viewport size is calculated on the default threeJS scene camera
  const [initialViewportSize, setInitialViewportSize] = useState<{ width: number; height: number }>();
  useEffect(() => {
    if (isCameraReady && !initialViewportSize) {
      setInitialViewportSize({ height: viewportHeight, width: viewportWidth });
    }
  }, [viewportHeight, isCameraReady, initialViewportSize, viewportWidth]);

  const instances = useMemo(() => {
    if (!initialViewportSize) return [];

    // Calculate the max row items count based on the viewport width, limited to 5
    const _rowItemsCount = Math.floor(initialViewportSize.width / (SPHERE_RADIUS * 2));
    const rowItemsCount = Math.min(_rowItemsCount, 5);

    const instances: InstancedRigidBodyProps[] = [...Array(SPHERES_COUNT)].map((_, i) => {
      const xRange = (rowItemsCount * SPHERE_RADIUS * 2) / 2;
      const x = getRandomNumber(-xRange, xRange);
      const y = initialViewportSize.height / 2 + SPHERE_RADIUS + SPHERES_GAP * i;
      return {
        key: "instance_" + i,
        position: [x, y, 0],
      };
    });

    return instances;
  }, [initialViewportSize]);

  return (
    <InstancedRigidBodies
      ref={spheresRef}
      instances={instances}
      colliders={animationEnabled ? "ball" : false}
      restitution={restitution}
      mass={10}
      key={`spheres_${animationEnabled ? "enabled" : "disabled"}_${restitution}`}
    >
      <instancedMesh args={[undefined, undefined, SPHERES_COUNT]} count={SPHERES_COUNT} castShadow receiveShadow>
        <sphereGeometry args={[SPHERE_RADIUS, 32]} />
        <meshStandardMaterial color="gray" />
      </instancedMesh>
    </InstancedRigidBodies>
  );
};

const Scene = () => {
  const { debugView, perf, orbitControls, axesHelper } = useControls("Debug", {
    debugView: false,
    perf: false,
    orbitControls: false,
    axesHelper: false,
  });

  const [isCameraReady, setIsCameraReady] = useState(false);

  return (
    <>
      {perf && <Perf position="top-left" />}
      {orbitControls && <OrbitControls />}

      <OrthographicCamera
        makeDefault={true}
        position={[0, 0, 50]}
        zoom={50}
        onUpdate={() => {
          setIsCameraReady(true);
        }}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 2, 3]} intensity={1.5} castShadow />

      {axesHelper && (
        <axesHelper
          scale={2}
          position={[0, 0, 0]}
          onUpdate={(self) => self.setColors("#ff2080", "#20ff80", "#2080ff")}
        />
      )}

      <Physics debug={debugView}>
        <Container />
        <Spheres isCameraReady={isCameraReady} />
      </Physics>
    </>
  );
};

export const Ballpit = () => {
  return (
    <Canvas shadows>
      <Suspense>
        <Scene />
      </Suspense>
    </Canvas>
  );
};
