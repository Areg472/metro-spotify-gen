import { useEffect, useState, useRef } from "react";

/**
 * Animated train dot that travels along the highlighted metro path.
 * Only rendered when both stations are selected and on a single line.
 *
 * @param {Object} props
 * @param {Array<{x: number, y: number, key: string}>} props.pathCoords - ordered station coordinates
 * @param {number} props.connectorSize - the default connector size (to offset to center)
 * @param {string} props.color - line color for the train dot
 */
export function TrainAnimation({ pathCoords, connectorSize, color }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  // Duration of one full animation cycle in ms (scales with path length)
  const durationMs = Math.max(2000, pathCoords.length * 800);

  useEffect(() => {
    startTimeRef.current = null;
    progressRef.current = 0;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathCoords, durationMs]);

  if (!pathCoords || pathCoords.length < 2) return null;

  // Compute total path length (in pixel units)
  const segLengths = [];
  let totalLength = 0;
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const dx = pathCoords[i + 1].x - pathCoords[i].x;
    const dy = pathCoords[i + 1].y - pathCoords[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLength += len;
  }

  // Find position at current progress
  const targetDist = progress * totalLength;
  let accumulated = 0;
  let posX = pathCoords[0].x;
  let posY = pathCoords[0].y;

  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= targetDist) {
      const segProgress =
        segLengths[i] > 0 ? (targetDist - accumulated) / segLengths[i] : 0;
      posX =
        pathCoords[i].x + (pathCoords[i + 1].x - pathCoords[i].x) * segProgress;
      posY =
        pathCoords[i].y + (pathCoords[i + 1].y - pathCoords[i].y) * segProgress;
      break;
    }
    accumulated += segLengths[i];
  }

  // Offset to center of connector cell
  const center = connectorSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: `${posX + center}px`,
        top: `${posY + center}px`,
        width: 24,
        height: 12,
        marginLeft: -12,
        marginTop: -6,
        borderRadius: "3px",
        background: color || "white",
        boxShadow: "none",
        zIndex: 50,
        pointerEvents: "none",
        transition: "left 0.05s linear, top 0.05s linear",
      }}
    />
  );
}
