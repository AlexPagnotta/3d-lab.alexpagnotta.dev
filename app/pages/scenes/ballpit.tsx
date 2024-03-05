import { Box, Environment, OrbitControls, PerspectiveCamera, SpotLight } from "@react-three/drei";
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

import { useMediaQuery } from "~/features/dom/hooks/use-media-query";
import { up } from "~/features/dom/utils/screens";
import { getRandomNumber } from "~/features/utils/random";

const CONTAINER_COLOR = "#ffffff";
const SPHERES_COLOR = "#ffffff";

const SPHERES_COUNT = 40;
const SPHERE_RADIUS = 1;
const SPHERES_GAP = SPHERE_RADIUS * 2;

const PANELS_GAP = SPHERE_RADIUS * 2 + 0.3;
const PANELS_THICKNESS = 0.5;
const PANELS_THICKNESS_DESKTOP = 2;
const PANELS_DEPTH = PANELS_GAP;

const PANELS_OFFSET = SPHERES_GAP * SPHERES_COUNT; // How much the panels are offseted from the viewport edge in height

type PanelPosition = "bottom" | "top" | "left" | "right" | "back" | "front";

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

const Container = () => {
  const isMdUp = useMediaQuery(up("md"));
  const { width: viewportWidth, height: viewportHeight } = useThree((state) => state.viewport);

  const panelsThickness = isMdUp ? PANELS_THICKNESS_DESKTOP : PANELS_THICKNESS;

  const panelsWidth = viewportWidth - panelsThickness * 2;
  const panelsHeight = viewportHeight + PANELS_OFFSET;

  return (
    <RigidBody type="fixed" colliders={false} position={[0, -viewportHeight / 2 + panelsThickness, 0]}>
      {/* Bottom */}
      <Box {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["bottom"]} receiveShadow>
        <meshStandardMaterial color={CONTAINER_COLOR} />
      </Box>
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["bottom"]} />

      {/* Top */}
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["top"]} />

      {/* Left */}
      <Box {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["left"]} receiveShadow>
        <meshStandardMaterial color={CONTAINER_COLOR} />
      </Box>
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["left"]} />

      {/* Right */}
      <Box {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["right"]} receiveShadow>
        <meshStandardMaterial color={CONTAINER_COLOR} />
      </Box>
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["right"]} />

      {/* Back */}
      <Box {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["back"]} receiveShadow>
        <meshStandardMaterial color={CONTAINER_COLOR} />
      </Box>
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["back"]} />

      {/* Front */}
      <CuboidCollider scale={0.5} {...ContainerPanels(panelsWidth, panelsHeight, panelsThickness)["front"]} />
    </RigidBody>
  );
};

Container.displayName = "Container";

const Spheres = ({ isCameraReady }: { isCameraReady: boolean }) => {
  const { enabled: animationEnabled, restitution } = useControls("Settings", {
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
      <instancedMesh args={[undefined, undefined, SPHERES_COUNT]} count={SPHERES_COUNT} castShadow>
        <sphereGeometry args={[SPHERE_RADIUS, 32]} />
        <meshStandardMaterial color={SPHERES_COLOR} />
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
      <ambientLight intensity={0.5} />
      <Environment preset={"city"} />
      <SpotLight
        castShadow
        intensity={500}
        position={[0, 10, 10]}
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

export const Ballpit = () => {
  return (
    <Canvas shadows>
      <Suspense>
        <Scene />
      </Suspense>
    </Canvas>
  );
};
