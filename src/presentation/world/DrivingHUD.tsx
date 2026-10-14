import type { RoadTelemetry } from "../../domain/world/driving";

/** Optional driving mode keeps the portfolio available without a game dashboard. */
export function DrivingHUD({ telemetry }: { telemetry: RoadTelemetry }) {
  return (
    <aside className="coastal-drive-status" aria-label="Driving status">
      <span>BMW M4 Competition</span>
      <strong>
        {Math.round(Math.abs(telemetry.speed) * 3.6)} <small>km/h</small>
      </strong>
      <span className="drive-key-help">
        WASD to drive <i /> Space to brake <i /> R to reset
      </span>
    </aside>
  );
}
