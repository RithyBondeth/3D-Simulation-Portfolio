import { memo, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as T from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { worldDestinations } from "../../domain/world/destinations";
import { spawnCar } from "../../domain/world/driving";
import IslandScene from "./IslandScene";
import CoastalWorld from "./CoastalWorld";
import GroundingShadows from "./GroundingShadows";
import { SceneMotion } from "./SceneMotion";
import {
  journeyCarPose,
  journeyFov,
  journeyFrame,
  journeyChapter,
  journeyShot,
} from "../../domain/world/scroll-journey";
import { projectDistricts } from "../../domain/portfolio/project-districts";
import type { WorldCanvasProps as Props } from "../../application/world-contract";
import DrivingController from "./DrivingController";
import AdaptiveQuality from "./AdaptiveQuality";
function Scene(props: Props) {
  const sunTarget = useMemo(() => {
    const target = new T.Object3D();
    target.position.set(38, 0, 0);
    return target;
  }, []);
  const architecture = useRef<T.Group>(null!);
  const car = useRef(spawnCar()),
    controls = useRef<OrbitControlsImpl | null>(null);
  const dragging = useRef(false);
  const { size, invalidate } = useThree();
  const cameraTarget = useRef(new T.Vector3(0, 1, 3));
  const perspective = useRef<T.PerspectiveCamera>(null),
    overview = useRef<T.PerspectiveCamera>(null);
  useEffect(() => {
    const c = props.immersive ? perspective.current : overview.current;
    if (!c || size.width <= 0 || size.height <= 0) return;
    const target = props.immersive
      ? new T.Vector3(car.current.x, 1.2, car.current.z)
      : new T.Vector3(0, 0.5, 3);
    if (props.immersive)
      c.position.set(car.current.x - 12, 5.5, car.current.z + 5);
    else {
      const frame = journeyFrame(size.width, size.height);
      const shot = journeyShot(
        props.reduceMotion
          ? projectDistricts.find((d) => d.id === props.activeDistrictId)!.stop
          : props.journeyProgress,
      );
      c.position.set(
        shot.camera[0] * frame,
        shot.camera[1] * frame,
        shot.camera[2] * frame,
      );
      target.set(...(shot.target as [number, number, number]));
    }
    if (!props.immersive && size.width > 900)
      c.setViewOffset(
        size.width,
        size.height,
        -size.width * 0.15,
        0,
        size.width,
        size.height,
      );
    else c.clearViewOffset();
    c.lookAt(target);
    cameraTarget.current.copy(target);
    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
    invalidate();
  }, [props.immersive, props.reset, size.width, size.height, invalidate]);
  useEffect(() => {
    invalidate();
  }, [props.journeyProgress, props.activeDistrictId, props.paused, invalidate]);
  useFrame((state, dt) => {
    if (props.immersive || !overview.current || props.paused) return;
    const p = props.reduceMotion
      ? projectDistricts.find((d) => d.id === props.activeDistrictId)!.stop
      : car.current.distance / journeyCarPose(1).distance;
    const shot = journeyShot(p),
      frame = journeyFrame(size.width, size.height);
    const c = overview.current,
      wanted = new T.Vector3(
        ...(shot.camera as [number, number, number]),
      ).multiplyScalar(frame);
    const target = new T.Vector3(...(shot.target as [number, number, number]));
    if (!props.reduceMotion && size.width > 900) {
      wanted.x += state.pointer.x * 1.4;
      wanted.y += state.pointer.y * 0.7;
    }
    const mix = props.reduceMotion
      ? 1
      : 1 - Math.exp(-Math.min(dt, 0.05) * 3.5);
    c.position.lerp(wanted, mix);
    cameraTarget.current.lerp(target, mix);
    c.lookAt(cameraTarget.current);
    if (
      c.position.distanceToSquared(wanted) > 0.0001 ||
      cameraTarget.current.distanceToSquared(target) > 0.0001
    )
      invalidate();
  }, -0.4);
  useEffect(() => {
    props.onReady();
  }, [props.onReady]);
  return (
    <SceneMotion
      active={!props.paused && !props.reduceMotion && !props.ambientPaused}
    >
      <AdaptiveQuality
        enabled={
          props.automaticQuality &&
          props.graphicsQuality === "high" &&
          !props.paused &&
          !props.ambientPaused &&
          !props.reduceMotion
        }
        onReduce={props.onReduceQuality}
      />
      <color attach="background" args={[props.night ? "#142c35" : "#bddbd7"]} />
      <fog
        attach="fog"
        args={[props.night ? "#224952" : "#bddbd7", 210, 620]}
      />
      <PerspectiveCamera
        ref={perspective}
        makeDefault={props.immersive}
        fov={52}
        near={0.15}
        far={800}
        position={[-24, 5.5, 35.5]}
      />
      <PerspectiveCamera
        ref={overview}
        makeDefault={!props.immersive}
        fov={journeyFov}
        near={0.1}
        far={800}
        position={[75, 57, 95]}
      />
      <ambientLight intensity={props.night ? 0.28 : 0.18} />
      <hemisphereLight
        args={[
          props.night ? "#9cc8e5" : "#e8f5ee",
          "#739d8c",
          props.night ? 0.6 : 0.62,
        ]}
      />
      <primitive object={sunTarget} />
      <directionalLight
        target={sunTarget}
        position={[-7, 70, 45]}
        intensity={props.night ? 1.8 : 2.6}
        color={props.night ? "#acd5ef" : "#ffe4c1"}
        castShadow
        shadow-mapSize={
          props.graphicsQuality === "low" ? [1024, 1024] : [2048, 2048]
        }
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-near={1}
        shadow-camera-far={250}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
        shadow-radius={2}
      />
      {props.graphicsQuality === "high" && (
        <Environment
          files="/environment/world-sky.hdr"
          background={false}
          environmentIntensity={props.night ? 0.35 : 0.3}
          environmentRotation={[0, 2.2, 0]}
        />
      )}
      <directionalLight
        position={[35, 25, -35]}
        color="#7bd6cd"
        intensity={props.night ? 0.75 : 0.45}
      />
      <CoastalWorld night={props.night} quality={props.graphicsQuality} />
      <GroundingShadows />
      <IslandScene
        night={props.night}
        quality={props.graphicsQuality}
        onSelect={props.onSelect}
        buildingsRef={architecture}
        chapter={journeyChapter(props.journeyProgress)}
        immersive={props.immersive}
        activeDistrictId={props.activeDistrictId}
        projectIndex={props.projectIndex}
        onDistrict={props.onDistrict}
      />
      {/* The portal already has a dedicated entry; avoid a second label inside it. */}
      {worldDestinations
        .filter((station) => station.id !== "labs")
        .map((s) => (
          <Html
            key={s.id}
            position={s.position}
            center
            distanceFactor={props.immersive ? 18 : undefined}
            occlude={props.immersive ? [architecture] : false}
            wrapperClass="world-world-label"
            zIndexRange={[12, 1]}
            style={{
              display:
                props.immersive ||
                (s.id === "skills" &&
                  journeyChapter(props.journeyProgress) === 1) ||
                (s.id === "experience" &&
                  journeyChapter(props.journeyProgress) === 2)
                  ? "block"
                  : "none",
              pointerEvents: props.paused ? "none" : "auto",
            }}
          >
            <button
              className={`world-label ${props.selected === s.id ? "active" : ""}`}
              aria-label={`Explore ${s.title}`}
              onClick={() => props.onSelect(s.id)}
            >
              <span>
                {s.id === "projects"
                  ? "The work"
                  : s.id === "labs"
                    ? "AI & experiments"
                    : s.title}
              </span>
              <ArrowUpRightIcon size={12} />
            </button>
          </Html>
        ))}
      <DrivingController
        {...props}
        paused={props.paused}
        car={car}
        controls={controls}
        dragging={dragging}
      />
      <OrbitControls
        ref={controls}
        makeDefault
        onStart={() => {
          dragging.current = true;
        }}
        onEnd={() => {
          dragging.current = false;
        }}
        enablePan={false}
        enabled={props.immersive && !props.paused}
        minDistance={props.immersive ? 7 : 80}
        maxDistance={props.immersive ? 55 : 220}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.15}
        enableDamping
        dampingFactor={0.09}
        target={props.immersive ? [-12, 1.2, 30.5] : [0, 0.5, 3]}
      />
    </SceneMotion>
  );
}
export default memo(function WorldCanvas(props: Props) {
  return (
    <Canvas
      className="island-canvas"
      shadows="percentage"
      frameloop="demand"
      dpr={props.graphicsQuality === "low" ? [1, 1.1] : [1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = T.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
});
