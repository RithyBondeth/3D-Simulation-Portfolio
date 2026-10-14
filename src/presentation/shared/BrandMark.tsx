import { byteHead, byteEyes, byteMouth } from "../../domain/brand/byte";

const paintClasses = {
  ink: "byte-ink",
  face: "byte-face",
  shade: "byte-shade",
  accent: "byte-accent",
};

/** Byte's original pixel geometry from the bondeth.dev portfolio. */
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`bondeth-mark ${className}`}
      viewBox="0 0 34 26"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {[...byteHead, ...byteEyes, ...byteMouth].map(
        ([x, y, width, height, paint]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={width}
            height={height}
            className={paintClasses[paint]}
          />
        ),
      )}
    </svg>
  );
}

export function BrandName() {
  return (
    <span className="brand-copy">
      <strong>Bondeth</strong>
      <span className="brand-pixel-trail" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}
