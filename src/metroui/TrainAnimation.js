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
    let len = Math.sqrt(dx * dx + dy * dy);

    // If it's a transfer (0px physical distance), give it artificial length for a pause
    if (len === 0) {
      len = connectorSize * 1.5;
    }

    segLengths.push(len);
    totalLength += len;
  }

  // Find position at current progress
  const targetDist = progress * totalLength;
  let accumulated = 0;
  let posX = pathCoords[0].x;
  let posY = pathCoords[0].y;

  let angle = 0;
  let currentColor = pathCoords[0]?.lineId || color || "white";
  let isTransferring = false;
  let textLabel = null;

  for (let i = 0; i < segLengths.length; i++) {
    const isTrans = pathCoords[i].x === pathCoords[i+1].x && pathCoords[i].y === pathCoords[i+1].y || pathCoords[i].lineId !== pathCoords[i+1].lineId;

    if (accumulated + segLengths[i] >= targetDist) {
      const segProgress =
        segLengths[i] > 0 ? (targetDist - accumulated) / segLengths[i] : 0;
      posX =
        pathCoords[i].x + (pathCoords[i + 1].x - pathCoords[i].x) * segProgress;
      posY =
        pathCoords[i].y + (pathCoords[i + 1].y - pathCoords[i].y) * segProgress;

      currentColor = pathCoords[i+1]?.lineId || color || "white";

      if (isTrans) {
        isTransferring = true;
        textLabel = "Transferring...";
        // Blink between previous line color and next line color during transfer
        if (Math.floor(segProgress * 10) % 2 === 0) {
             currentColor = pathCoords[i].lineId || color || "white";
        } else {
             currentColor = pathCoords[i+1].lineId || color || "white";
        }
      } else {
        const dx = pathCoords[i + 1].x - pathCoords[i].x;
        const dy = pathCoords[i + 1].y - pathCoords[i].y;
        angle = Math.atan2(dy, dx) * (180 / Math.PI);
      }
      break;
    } else {
      if (!isTrans) {
        const dx = pathCoords[i + 1].x - pathCoords[i].x;
        const dy = pathCoords[i + 1].y - pathCoords[i].y;
        angle = Math.atan2(dy, dx) * (180 / Math.PI);
      }
    }
    accumulated += segLengths[i];
  }

  // Offset to center of connector cell
  const center = connectorSize / 2;

  return (
    <>
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
          background: currentColor,
          boxShadow: isTransferring ? "0 0 10px rgba(255,255,255,0.8)" : "none",
          zIndex: 5,
          pointerEvents: "none",
          transform: `rotate(${angle}deg)`,
          transition:
            "left 0.05s linear, top 0.05s linear, transform 0.05s linear, background 0.1s linear",
        }}
      />
      {isTransferring && (
        <div
          style={{
            position: "absolute",
            left: `${posX + center}px`,
            top: `${posY + center - 25}px`,
            transform: "translateX(-50%)",
            color: "white",
            background: "rgba(0,0,0,0.7)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            zIndex: 6,
            pointerEvents: "none",
          }}
        >
          {textLabel}
        </div>
      )}
    </>
  );
}
