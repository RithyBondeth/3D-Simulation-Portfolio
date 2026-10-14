import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import * as T from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { worldDestinations } from "../../domain/world/destinations";
import { type SectionId } from "../../domain/portfolio/types";
import {
  advanceCar,
  onRoad,
  spawnCar,
  type CarState,
} from "../../domain/world/driving";
import {
  driveElevation,
  driveSurfacePitch,
} from "../../domain/world/infrastructure";
import { journeyCarPose } from "../../domain/world/scroll-journey";
import { projectDistricts } from "../../domain/portfolio/project-districts";
import BmwModel from "./BmwModel";
import type { WorldCanvasProps as Props } from "../../application/world-contract";

export default function DrivingController({
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
}: Pick<
  Props,
  | "movement"
  | "paused"
  | "reset"
  | "onNear"
  | "onTelemetry"
  | "immersive"
  | "reduceMotion"
  | "journeyProgress"
  | "activeDistrictId"
  | "onDrive"
> & {
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
    body.current!.rotation.order = "YXZ";
    body.current!.rotation.x = 0;
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
      body.current!.position.set(
        state.x,
        0.09 + driveElevation(state.x, state.z),
        state.z,
      );
      body.current!.rotation.y = state.yaw;
      body.current!.rotation.x = driveSurfacePitch(state.x, state.z, state.yaw);
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
    body.current!.position.set(
      state.x,
      0.09 + driveElevation(state.x, state.z),
      state.z,
    );
    body.current!.rotation.y = state.yaw;
    body.current!.rotation.x = driveSurfacePitch(state.x, state.z, state.yaw);
    const station = worldDestinations.reduce<{
      id: SectionId | null;
      distance: number;
    }>(
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
      target.set(state.x, 1.2 + driveElevation(state.x, state.z), state.z);
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
        <BmwModel car={car} steering={steering} />
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
          className="world-label car-label"
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
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
