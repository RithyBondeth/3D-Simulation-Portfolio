import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import * as T from "three";
import { Instances, type Piece } from "./IslandDistrict";
import { railPose, railHeight, trainSchedule } from "../lib/sky-rail";
import { useCartoonMotion } from "./CartoonMotion";

export default function SkyTrain({ phase, night }: { phase: number; night: boolean }) {
  const coaches = useRef<(T.Group | null)[]>([]),
    doors = useRef<(T.Group | null)[]>([]);
  const pieces = useMemo<Piece[]>(
    () => [
      { at: [0, -0.8, 0], size: [2.5, 0.25, 5.8], color: "#33584e" },
      { at: [0, 0.2, 0], size: [2.72, 0.95, 4.9], color: "#24515c" },
      { at: [0, 1.13, 0.5], size: [1.9, 0.12, 3.1], color: "#6a9a83" },
      { at: [0, -0.55, 0], size: [2.76, 0.2, 5.5], color: "#38664e" },
    ],
    [],
  );
  const current = useRef(trainSchedule(0, phase));
  useCartoonMotion((time) => {
    const schedule = trainSchedule(time, phase);
    current.current = schedule;
    coaches.current.forEach((coach, i) => {
      if (!coach) return;
      const pose = railPose(schedule.distance - i * 7.2);
      coach.position.set(pose.x, railHeight + 1.35, pose.z);
      coach.rotation.y = pose.yaw;
    });
    doors.current.forEach((door, i) => {
      if (door)
        door.position.z = (i % 2 ? 1 : -1) * (schedule.stopped ? 1.5 : 0.7);
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => {
        const pose = railPose(current.current.distance - i * 7.2);
        return (
          <group
            key={i}
            ref={(node) => {
              coaches.current[i] = node;
            }}
            position={[pose.x, railHeight + 1.35, pose.z]}
            rotation={[0, pose.yaw, 0]}
          >
            <RoundedBox
              args={[2.7, 2.2, 6.5]}
              radius={0.5}
              smoothness={2}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#eceddb"
                roughness={0.5}
                metalness={0.15}
              />
            </RoundedBox>
            <Instances pieces={pieces} night={night} />
            {[-1, 1].map((side) => (
              <group
                key={side}
                ref={(node) => {
                  doors.current[i * 2 + (side > 0 ? 1 : 0)] = node;
                }}
                position={[1.39, 0, side * (current.current.stopped ? 1.5 : 0.7)]}
              >
                <mesh>
                  <boxGeometry args={[0.06, 1.85, 1.25]} />
                  <meshStandardMaterial color="#c1d4c2" roughness={0.5} />
                </mesh>
                <mesh position={[0.04, 0.25, 0]}>
                  <boxGeometry args={[0.04, 0.65, 0.85]} />
                  <meshStandardMaterial
                    color="#2e5860"
                    emissive={night ? "#86b7a0" : "#000000"}
                    emissiveIntensity={0.25}
                  />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.1, -3.19]}>
              <boxGeometry args={[1.9, 1, 0.08]} />
              <meshStandardMaterial color="#234b57" roughness={0.3} />
            </mesh>
            {i === 0 &&
              [-0.8, 0.8].map((x) => (
                <mesh key={x} position={[x, -0.45, -3.22]}>
                  <boxGeometry args={[0.3, 0.16, 0.08]} />
                  <meshStandardMaterial
                    color="#e5f8db"
                    emissive="#b6d9ab"
                    emissiveIntensity={night ? 1 : 0.3}
                  />
                </mesh>
              ))}
          </group>
        );
      })}
    </>
  );
}
