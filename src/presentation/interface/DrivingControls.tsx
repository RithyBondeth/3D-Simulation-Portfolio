import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@phosphor-icons/react";
import { type MovementInput } from "../../application/driving-input";
import type React from "react";
export default function DrivingControls({
  movement,
  move,
}: {
  movement: React.RefObject<MovementInput>;
  move: (x?: number, z?: number) => void;
}) {
  return (
    <div className="drive-touch-controls" aria-label="Driving controls">
      {[
        {
          x: -1,
          z: undefined,
          label: "Steer left",
          Icon: ArrowLeftIcon,
          className: "steer-left",
        },
        {
          x: 1,
          z: undefined,
          label: "Steer right",
          Icon: ArrowRightIcon,
          className: "steer-right",
        },
        {
          x: undefined,
          z: 1,
          label: "Reverse",
          Icon: ArrowDownIcon,
          className: "reverse",
        },
        {
          x: undefined,
          z: -1,
          label: "Accelerate",
          Icon: ArrowUpIcon,
          className: "accelerate",
        },
      ].map(({ x, z, label, Icon, className }) => (
        <button
          key={label}
          className={className}
          aria-label={label}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            move(x, z);
          }}
          onPointerUp={() =>
            move(
              x === undefined ? undefined : 0,
              z === undefined ? undefined : 0,
            )
          }
          onPointerCancel={() =>
            move(
              x === undefined ? undefined : 0,
              z === undefined ? undefined : 0,
            )
          }
          onLostPointerCapture={() =>
            move(
              x === undefined ? undefined : 0,
              z === undefined ? undefined : 0,
            )
          }
        >
          <Icon size={22} />
        </button>
      ))}
      <button
        className="brake"
        aria-label="Brake"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          movement.current.brake = true;
          movement.current.invalidate?.();
        }}
        onPointerUp={() => {
          movement.current.brake = false;
        }}
        onPointerCancel={() => {
          movement.current.brake = false;
        }}
        onLostPointerCapture={() => {
          movement.current.brake = false;
        }}
      >
        BRAKE
      </button>
    </div>
  );
}
