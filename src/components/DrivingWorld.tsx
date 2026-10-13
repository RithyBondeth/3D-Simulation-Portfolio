import {
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as T from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { stations, type MovementInput, type SectionId } from "../types";
import {
  advanceCar,
  onRoad,
  spawnCar,
  type CarState,
  type RoadTelemetry,
} from "../lib/driving";
import MetaverseWorld from "./MetaverseWorld";
import CoastalWorld from "./CoastalWorld";
import { CartoonMotion } from "./CartoonMotion";
import {
  journeyCarPose,
  journeyFov,
  journeyFrame,
  journeyChapter,
  journeyShot,
} from "../lib/coastal-journey";

import { projectDistricts, type DistrictId } from "../lib/project-districts";
import {
  shouldReduceQuality,
  type GraphicsQuality,
} from "../lib/graphics-quality";

type Props = {
  graphicsQuality: GraphicsQuality;
  automaticQuality: boolean;
  onReduceQuality: () => void;
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  onProject: (id: string) => void;
  onReady: () => void;
  onNear: (id: SectionId | null) => void;
  onTelemetry: (value: RoadTelemetry) => void;
  night: boolean;
  reduceMotion: boolean;
  paused: boolean;
  reset: number;
  movement: MutableRefObject<MovementInput>;
  immersive: boolean;
  onDrive: () => void;
  journeyProgress: number;
  ambientPaused: boolean;
  activeDistrictId: DistrictId;
  projectIndex: number;
  onDistrict: (id: DistrictId) => void;
};
function CambodiaPlates() {
  const texture = useTexture("/textures/cambodia-plate.png");
  texture.colorSpace = T.SRGBColorSpace;
  return (
    <>
      {[
        { z: -2.45, y: 0.74, width: 0.8 },
        { z: 2.44, y: 0.48, width: 0.77 },
      ].map(({ z, y, width }) => (
        <group
          key={z}
          position={[0, y, z]}
          rotation={[0, z < 0 ? Math.PI : 0, 0]}
        >
          <mesh position={[0, 0, -0.018]} castShadow>
            <boxGeometry args={[width + 0.025, width / 4.73 + 0.022, 0.025]} />
            <meshStandardMaterial color="#172126" roughness={0.5} />
          </mesh>
          <mesh>
            <planeGeometry args={[width, width / 4.73]} />
            <meshStandardMaterial map={texture} roughness={0.45} />
          </mesh>
        </group>
      ))}
    </>
  );
}
function BMW({
  car,
  steering,
}: {
  car: MutableRefObject<CarState>;
  steering: MutableRefObject<number>;
}) {
  const { scene } = useGLTF("/models/bmw-m4.glb");
  const model = useMemo(() => {
    const clone = scene.clone(true),
      root = new T.Group(),
      wheels: T.Group[] = [],
      frontWheels: T.Group[] = [];
    const materials = new Map<string, T.MeshStandardMaterial>(),
      geometries: T.BufferGeometry[] = [];
    clone.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(clone),
      size = box.getSize(new T.Vector3()),
      center = box.getCenter(new T.Vector3());
    clone.traverse((child) => {
      if (!(child instanceof T.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const customize = (original: T.MeshStandardMaterial) => {
        const paint =
          /body151|zx1|livery/i.test(original.name) ||
          ["Object_24", "Object_30"].includes(child.name);
        const key = original.uuid + (paint ? "paint" : "");
        if (materials.has(key)) return materials.get(key)!;
        const m = original.clone();
        if (paint) {
          m.color.set("#8acbdd");
          m.metalness = 0.35;
          m.roughness = 0.32;
          m.map = null;
          m.vertexColors = false;
        }
        if (/windows/i.test(m.name)) {
          m.color.set("#183544");
          m.roughness = 0.4;
          m.metalness = 0.15;
          m.transparent = false;
          m.opacity = 1;
          m.map = null;
        }
        if (/chrome51/i.test(m.name)) {
          m.color.set("#718b96");
          m.metalness = 0.8;
          m.roughness = 0.25;
        }
        if (/led111/i.test(m.name)) {
          m.emissive.set("#e0f5ff");
          m.emissiveIntensity = 0.65;
        }
        if (/m8rim001/i.test(m.name)) {
          m.color.set("#181c20");
          m.metalness = 0.04;
          m.roughness = 0.88;
        } else if (/m8rim1/i.test(m.name)) {
          m.color.set("#53636c");
          m.metalness = 0.85;
          m.roughness = 0.25;
        }
        if (/caliper/i.test(m.name)) {
          m.color.set("#34799d");
          m.metalness = 0.4;
        }
        materials.set(key, m);
        return m;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(customize)
        : customize(child.material);
      if (/m8rim/i.test((child.material as T.Material).name)) {
        // The artist grouped all four wheels in one mesh. Split the triangles into
        // wheel quadrants so the actual model's tyres and rims can roll and steer.
        const source: T.BufferGeometry = child.geometry.index
          ? child.geometry.toNonIndexed()
          : child.geometry.clone();
        const quantized = source.getAttribute("position");
        const decoded = new Float32Array(quantized.count * 3);
        for (let v = 0; v < quantized.count; v++) {
          decoded[v * 3] = quantized.getX(v);
          decoded[v * 3 + 1] = quantized.getY(v);
          decoded[v * 3 + 2] = quantized.getZ(v);
        }
        source.setAttribute("position", new T.BufferAttribute(decoded, 3));
        source.applyMatrix4(child.matrixWorld);
        const pos = source.getAttribute("position");
        const indices: number[][] = [[], [], [], []];
        for (let i = 0; i < pos.count; i += 3) {
          const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
          const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
          indices[(x > center.x ? 1 : 0) + (z > center.z ? 2 : 0)].push(
            i,
            i + 1,
            i + 2,
          );
        }
        indices.forEach((list, index) => {
          if (!list.length) return;
          const geo = new T.BufferGeometry();
          for (const [name, attr] of Object.entries(source.attributes)) {
            const values = new Float32Array(list.length * attr.itemSize);
            list.forEach((v, j) => {
              for (let k = 0; k < attr.itemSize; k++)
                values[j * attr.itemSize + k] = attr.getComponent(v, k);
            });
            geo.setAttribute(
              name,
              new T.BufferAttribute(values, attr.itemSize),
            );
          }
          geo.computeBoundingBox();
          const c = geo.boundingBox!.getCenter(new T.Vector3());
          geo.translate(-c.x, -c.y, -c.z);
          geometries.push(geo);
          const pivot = new T.Group(),
            rolling = new T.Group(),
            mesh = new T.Mesh(geo, child.material);
          pivot.position.copy(c);
          rolling.add(mesh);
          pivot.add(rolling);
          root.add(pivot);
          mesh.castShadow = true;
          wheels.push(rolling);
          if (index >= 2) frontWheels.push(pivot);
        });
        source.dispose();
        child.visible = false;
      }
    });
    root.add(clone);
    const scale = 4.85 / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return { root, wheels, frontWheels, materials, geometries };
  }, [scene]);
  useFrame((_, dt) => {
    model.wheels.forEach((w) => {
      w.rotation.x += (car.current.speed * Math.min(dt, 0.1)) / 0.36;
    });
    model.frontWheels.forEach((w) => {
      w.rotation.y = -steering.current * 0.4;
    });
  });
  useEffect(
    () => () => {
      model.materials.forEach((m) => m.dispose());
      model.geometries.forEach((g) => g.dispose());
    },
    [model],
  );
  return (
    <group rotation={[0, Math.PI, 0]}>
      <primitive object={model.root} />
      <CambodiaPlates />
    </group>
  );
}
function Drive({
  car,
  movement,
  paused,
  reset,
  onNear,
  onTelemetry,
  controls,
  dragging,
  immersive,
  reduceMotion,
  journeyProgress,
  activeDistrictId,
  onDrive,
}: Omit<Props, "onSelect" | "selected" | "night" | "onReady"> & {
  car: MutableRefObject<CarState>;
  controls: MutableRefObject<OrbitControlsImpl | null>;
  dragging: MutableRefObject<boolean>;
}) {
  const steering = useRef(0);
  const routeProgress = useRef(journeyProgress);
  const progress = useRef(journeyProgress);
  progress.current = reduceMotion
    ? projectDistricts.find((d) => d.id === activeDistrictId)!.stop
    : journeyProgress;
  const contactShadow = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => contactShadow.dispose(), [contactShadow]);
  const body = useRef<T.Group>(null),
    keys = useRef(new Set<string>()),
    nearRef = useRef<SectionId | null>(null),
    elapsed = useRef(0),
    reportedSpeed = useRef(0),
    cameraSettling = useRef(0);
  const { invalidate, camera } = useThree();
  const offset = useMemo(() => new T.Vector3(), []),
    target = useMemo(() => new T.Vector3(), []),
    wanted = useMemo(() => new T.Vector3(), []);
  useEffect(() => {
    movement.current.invalidate = invalidate;
    const held = keys.current;
    const keydown = (e: KeyboardEvent) => {
      if (
        paused ||
        !immersive ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof HTMLElement &&
          e.target.closest("input,textarea,select,[contenteditable]"))
      )
        return;
      const key = e.key.toLowerCase();
      if (
        key === " " &&
        e.target instanceof HTMLElement &&
        e.target.closest("button,a")
      )
        return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " ",
        ].includes(key)
      ) {
        e.preventDefault();
        held.add(key);
        invalidate();
      }
    };
    const keyup = (e: KeyboardEvent) => {
      held.delete(e.key.toLowerCase());
      invalidate();
    };
    const clear = () => {
      held.clear();
      movement.current.x = 0;
      movement.current.z = 0;
      movement.current.brake = false;
      car.current.speed = 0;
      invalidate();
    };
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
      held.clear();
      movement.current.invalidate = undefined;
    };
  }, [paused, immersive, invalidate, movement, car]);
  useEffect(() => {
    car.current = spawnCar();
    routeProgress.current = progress.current;
    if (!immersive)
      Object.assign(car.current, journeyCarPose(progress.current));
    cameraSettling.current = 0;
    invalidate();
  }, [reset, immersive, reduceMotion, car, invalidate]);
  useEffect(() => {
    invalidate();
  }, [journeyProgress, activeDistrictId, invalidate]);
  useEffect(() => {
    if (paused) {
      keys.current.clear();
      car.current.speed = 0;
      movement.current.x = 0;
      movement.current.z = 0;
      movement.current.brake = false;
      invalidate();
    }
  }, [paused, car, movement, invalidate]);
  useFrame((_, dt) => {
    if (!immersive) {
      const step = Math.min(dt, 0.05);
      const destination = progress.current;
      const previous = routeProgress.current;
      if (!paused)
        routeProgress.current = reduceMotion
          ? destination
          : T.MathUtils.damp(previous, destination, 7, step);
      const pose = journeyCarPose(routeProgress.current);
      const state = car.current;
      const travel = pose.distance - state.distance;
      const lastYaw = state.yaw;
      Object.assign(state, pose);
      state.speed =
        reduceMotion || paused || Math.abs(travel) < 0.001
          ? 0
          : travel / Math.max(step, 0.001);
      const turn = Math.atan2(
        Math.sin(pose.yaw - lastYaw),
        Math.cos(pose.yaw - lastYaw),
      );
      steering.current =
        Math.abs(travel) > 0.001
          ? T.MathUtils.clamp((-turn / travel) * 5, -1, 1)
          : 0;
      body.current!.position.set(state.x, 0.09, state.z);
      body.current!.rotation.y = state.yaw;
      if (!paused && Math.abs(destination - routeProgress.current) > 0.00001)
        invalidate();
      return;
    }
    const k = keys.current,
      m = movement.current;
    const throttle = paused
      ? 0
      : k.has("w") || k.has("arrowup")
        ? 1
        : k.has("s") || k.has("arrowdown")
          ? -1
          : -m.z;
    const steer = paused
      ? 0
      : k.has("a") || k.has("arrowleft")
        ? -1
        : k.has("d") || k.has("arrowright")
          ? 1
          : m.x;
    const brake = paused || k.has(" ") || !!m.brake;
    steering.current = steer;
    car.current = advanceCar(car.current, { throttle, steer, brake }, dt);
    const state = car.current;
    body.current!.position.set(state.x, 0.09, state.z);
    body.current!.rotation.y = state.yaw;
    const station = stations.reduce<{ id: SectionId | null; distance: number }>(
      (nearest, s) => {
        const d = Math.hypot(s.position[0] - state.x, s.position[2] - state.z);
        return d < nearest.distance ? { id: s.id, distance: d } : nearest;
      },
      { id: null, distance: 13 },
    );
    if (station.id !== nearRef.current) {
      nearRef.current = station.id;
      onNear(station.id);
    }
    elapsed.current += dt;
    const justStopped =
      Math.abs(state.speed) < 0.01 && Math.abs(reportedSpeed.current) >= 0.01;
    if (elapsed.current > 0.1 || justStopped) {
      onTelemetry({ ...state, offroad: !onRoad(state.x, state.z) });
      reportedSpeed.current = state.speed;
      elapsed.current = 0;
    }
    if (immersive && controls.current) {
      const control = controls.current;
      target.set(state.x, 1.2, state.z);
      const delta = target.clone().sub(control.target);
      camera.position.add(delta);
      control.target.copy(target);
      if (Math.abs(state.speed) > 0.08 && !dragging.current) {
        offset
          .set(2.4, 3.1, 13)
          .applyAxisAngle(T.Object3D.DEFAULT_UP, state.yaw);
        wanted.copy(target).add(offset);
        camera.position.lerp(wanted, reduceMotion ? 1 : 1 - Math.exp(-dt * 2));
        cameraSettling.current = 0.9;
      } else if (cameraSettling.current > 0) {
        cameraSettling.current -= dt;
      }
      control.update();
    }
    if (
      throttle ||
      steer ||
      Math.abs(state.speed) > 0.01 ||
      cameraSettling.current > 0
    )
      invalidate();
  }, -0.5);
  return (
    <group ref={body}>
      <group scale={1.2}>
        <BMW car={car} steering={steering} />
      </group>
      <Html
        position={[0, 4.8, 0]}
        center
        zIndexRange={[12, 1]}
        style={{
          display: immersive ? "none" : "block",
          pointerEvents: paused ? "none" : "auto",
        }}
      >
        <button
          className="pavilion-label car-label"
          aria-label="Drive the BMW M4"
          onClick={onDrive}
        >
          BMW M4 <ArrowUpRightIcon size={12} />
        </button>
      </Html>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[2.6, 5.4]} />
        <meshBasicMaterial
          map={contactShadow}
          color="#1b3037"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
function AdaptiveQuality({
  enabled,
  onReduce,
}: {
  enabled: boolean;
  onReduce: () => void;
}) {
  const frames = useRef<number[]>([]);
  const warmup = useRef(0);
  useFrame((_, dt) => {
    if (!enabled || document.hidden) {
      frames.current = [];
      warmup.current = 0;
      return;
    }
    warmup.current += Math.min(dt, 0.1);
    if (warmup.current < 3) return;
    frames.current.push(Math.min(dt, 0.25));
    if (frames.current.length === 90) {
      if (shouldReduceQuality(frames.current)) onReduce();
      frames.current = [];
    }
  });
  return null;
}
function Scene(props: Props) {
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
    <CartoonMotion
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
      <ambientLight intensity={props.night ? 0.4 : 0.28} />
      <hemisphereLight
        args={[
          props.night ? "#9cc8e5" : "#e8f5ee",
          "#739d8c",
          props.night ? 0.7 : 0.8,
        ]}
      />
      <directionalLight
        position={[-45, 70, 45]}
        intensity={props.night ? 1.8 : 2.5}
        color={props.night ? "#acd5ef" : "#ffe4c1"}
        castShadow
        shadow-mapSize={
          props.graphicsQuality === "low" ? [1024, 1024] : [2048, 2048]
        }
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0002}
        shadow-normalBias={0.08}
        shadow-radius={3}
      />
      {props.graphicsQuality === "high" && (
        <Environment
          files="/environment/city-sky.hdr"
          background={false}
          environmentIntensity={props.night ? 0.4 : 0.45}
          environmentRotation={[0, 2.2, 0]}
        />
      )}
      <directionalLight
        position={[35, 25, -35]}
        color="#7bd6cd"
        intensity={props.night ? 1 : 0.75}
      />
      <CoastalWorld night={props.night} quality={props.graphicsQuality} />
      <MetaverseWorld
        night={props.night}
        onSelect={props.onSelect}
        onProject={props.onProject}
        buildingsRef={architecture}
        chapter={journeyChapter(props.journeyProgress)}
        immersive={props.immersive}
        activeDistrictId={props.activeDistrictId}
        projectIndex={props.projectIndex}
        onDistrict={props.onDistrict}
      />
      {/* The portal already has a dedicated entry; avoid a second label inside it. */}
      {stations
        .filter((station) => station.id !== "labs")
        .map((s) => (
          <Html
            key={s.id}
            position={s.position}
            center
            distanceFactor={props.immersive ? 18 : undefined}
            occlude={props.immersive ? [architecture] : false}
            wrapperClass="pavilion-world-label"
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
              className={`pavilion-label ${props.selected === s.id ? "active" : ""}`}
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
      <Drive
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
    </CartoonMotion>
  );
}
export default memo(function DrivingWorld(props: Props) {
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
