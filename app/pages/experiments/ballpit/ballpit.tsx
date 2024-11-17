import { Box, Environment, OrbitControls, PerspectiveCamera, SpotLight } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { Suspense, useEffect, useMemo, useState } from "react";
import { MeshStandardMaterial, MeshToonMaterial } from "three";

import { getRandomNumber } from "~/features/utils/random";

// Constants
const SPHERES_COUNT = 40;
const SPHERE_RADIUS = 1;
const SPHERES_GAP = SPHERE_RADIUS * 2;

const PANELS_GAP = SPHERE_RADIUS * 2 + 0.3;
const PANELS_THICKNESS = 0.1;
const PANELS_DEPTH = PANELS_GAP;

const PANELS_OFFSET = SPHERES_GAP * SPHERES_COUNT; // How much the panels are offseted from the viewport edge in height

const defaultSettings = {
  debugView: false,
  perf: false,
  orbitControls: false,
  axesHelper: false,

  enabled: true,
  restitution: 0.5,

  containerColor: "#99b9fc",
  spheresColor: "#ff7685",
};

/**
 * Returns the dimensions and position of each container panel
 * @param width The width of the container
 * @param height The height of the container
 * @param thickness The thickness of the container panels
 * @returns An object with the dimensions and position of each panel
 */
const ContainerPanels = (
  width: number,
  height: number,
  thickness: number
): Record<PanelPosition, { args: [number, number, number]; position: [number, number, number] }> => ({
  bottom: {
    args: [width + thickness * 2, thickness, PANELS_DEPTH],
    position: [0, -thickness / 2, 0],
  },
  top: {
    args: [width + thickness * 2, thickness, PANELS_DEPTH],
    position: [0, height + thickness / 2, 0],
  },
  left: {
    args: [thickness, height, PANELS_DEPTH],
    position: [-(width / 2) - thickness / 2, height / 2, 0],
  },
  right: {
    args: [thickness, height, PANELS_DEPTH],
    position: [width / 2 + thickness / 2, height / 2, 0],
  },
  back: {
    args: [width + thickness * 2, height, thickness],
    position: [0, height / 2, -PANELS_DEPTH / 2 - thickness / 2],
  },
  front: {
    args: [width + thickness * 2, height, thickness],
    position: [0, height / 2, PANELS_DEPTH / 2 + thickness / 2],
  },
});

// Types
type PanelPosition = "bottom" | "top" | "left" | "right" | "back" | "front";

/**
 * The container of the ballpit
 */
const Container = () => {
  const { width: viewportWidth, height: viewportHeight } = useThree((state) => state.viewport);

  const { containerColor } = useControls("Scene", {
    containerColor: defaultSettings.containerColor,
  });

  const panelsWidth = viewportWidth - PANELS_THICKNESS * 2;
  const panelsHeight = viewportHeight + PANELS_OFFSET;

  // Material is created once, and shared between the panels
  const containerMaterial = useMemo(() => new MeshStandardMaterial({ color: containerColor }), [containerColor]);

  const containerPanelProps = ContainerPanels(panelsWidth, panelsHeight, PANELS_THICKNESS);

  return (
    <RigidBody type="fixed" colliders={false} position={[0, -viewportHeight / 2 + PANELS_THICKNESS, 0]}>
      {/* Bottom */}
      <Box {...containerPanelProps["bottom"]} receiveShadow material={containerMaterial} />
      <CuboidCollider scale={0.5} {...containerPanelProps["bottom"]} />

      {/* Top */}
      <CuboidCollider scale={0.5} {...containerPanelProps["top"]} />

      {/* Left */}
      <Box {...containerPanelProps["left"]} receiveShadow material={containerMaterial} />
      <CuboidCollider scale={0.5} {...containerPanelProps["left"]} />

      {/* Right */}
      <Box {...containerPanelProps["right"]} receiveShadow material={containerMaterial} />
      <CuboidCollider scale={0.5} {...containerPanelProps["right"]} />

      {/* Back */}
      <Box {...containerPanelProps["back"]} receiveShadow material={containerMaterial} />
      <CuboidCollider scale={0.5} {...containerPanelProps["back"]} />

      {/* Front */}
      <CuboidCollider scale={0.5} {...containerPanelProps["front"]} />
    </RigidBody>
  );
};

/**
 * The spheres of the ballpit
 */
const Spheres = ({ isCameraReady }: { isCameraReady: boolean }) => {
  const { enabled: animationEnabled, restitution } = useControls("Settings", {
    enabled: defaultSettings.enabled,
    restitution: {
      min: 0,
      max: 1,
      value: defaultSettings.restitution,
      step: 0.1,
    },
  });

  const { spheresColor } = useControls("Scene", {
    spheresColor: defaultSettings.spheresColor,
  });

  const { height: viewportHeight, width: viewportWidth } = useThree((state) => state.viewport);

  // Set viewport size when camera is ready
  // Needed cause on first rerender the viewport size is calculated on the default threeJS scene camera
  const [initialViewportSize, setInitialViewportSize] = useState<{ width: number; height: number }>();
  useEffect(() => {
    if (isCameraReady && !initialViewportSize) {
      setInitialViewportSize({ height: viewportHeight, width: viewportWidth });
    }
  }, [viewportHeight, isCameraReady, initialViewportSize, viewportWidth]);

  // Spheres are instanced, for performance reasons
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

  const spheresMaterial = useMemo(() => new MeshToonMaterial({ color: spheresColor }), [spheresColor]);

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders={animationEnabled ? "ball" : false}
      restitution={restitution}
      mass={10}
      key={`spheres_${animationEnabled ? "enabled" : "disabled"}_${restitution}`}
    >
      <instancedMesh
        args={[undefined, undefined, SPHERES_COUNT]}
        count={SPHERES_COUNT}
        castShadow
        material={spheresMaterial}
      >
        <sphereGeometry args={[SPHERE_RADIUS, 32]} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
};

/**
 * The scene of the ballpit
 */
const Scene = () => {
  const { debugView, perf, orbitControls, axesHelper } = useControls("Debug", {
    debugView: defaultSettings.debugView,
    perf: defaultSettings.perf,
    orbitControls: defaultSettings.orbitControls,
    axesHelper: defaultSettings.axesHelper,
  });

  const [isCameraReady, setIsCameraReady] = useState(false);

  return (
    <>
      {perf && <Perf position="top-left" />}
      {orbitControls && <OrbitControls />}
      <PerspectiveCamera
        makeDefault={true}
        position={[0, 0, 50]}
        fov={20}
        near={0.01}
        far={500}
        onUpdate={() => {
          setIsCameraReady(true);
        }}
      />
      <ambientLight intensity={1} />
      <Environment preset="warehouse" />
      <SpotLight
        castShadow
        intensity={700}
        position={[0, 0, 15]}
        angle={Math.PI / 3}
        penumbra={0.5}
        distance={50}
        shadow-mapSize={2048}
      />
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

/**
 * The ballpit experiment
 */
export const Ballpit = () => {
  return (
    <>
      <Leva
        titleBar={{
          title: "Settings",
        }}
      />

      <Canvas shadows>
        <Suspense>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
};
