export function Connector({
  x = 0,
  y = 0,
  size = 100,
  color,
  thickness = 6,
  axisCount = 1,
  // Main axes
  horizontal = false,
  vertical = false,
  // Half axes
  left = false,
  right = false,
  top = false,
  bottom = false,
  // Diagonal segments (from center to corners)
  diagonalNW = false,
  diagonalNE = false,
  diagonalSW = false,
  diagonalSE = false,
  // Full diagonals (from corner to corner)
  fullDiagonal = false, // (0,0) to (100,100)
  fullDiagonalInv = false, // (0,100) to (100,0)
  // Station props
  station = false,
  stationColor,
  stationInnerColor,
  // Label props
  label,
  labelColor = "white",
  labelBg = "transparent",
  labelFontSize = 11,
  labelOffset = 4,
  labelPlacement, // optional: "right" | "left" | "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left"
  labelRotation = -45, // common for metro maps to avoid horizontal collisions
  onClick,
  isSelected = false,
  isEndStation = false,
  dimmed = false,
  zIndex,
  children,
}) {
  const lines = [];
  const offsetStep = thickness * 2;
  const center = size / 2;
  const opacity = dimmed ? 0.2 : 1;

  const outerRadius = 15;
  const sColor = stationColor || color;
  const sInnerColor = stationInnerColor || "none";
  const innerRadius =
    sInnerColor !== "none" && sInnerColor !== sColor
      ? outerRadius - thickness / 2
      : 0;

  // Determine best label placement to avoid overlapping the station icon
  // Priority: explicit prop -> infer from connected directions -> default to right
  let placement = labelPlacement;
  if (!placement) {
    // If it's a horizontal line segment, we want labels to be above it (top-left or top-right)
    // to avoid overlapping with the line itself.
    if (horizontal || right || left) {
      placement = "top-right";
    } else if (vertical || top || bottom) {
      placement = "top-right";
    } else {
      placement = "top-right";
    }
  }

  // Compute label position relative to the station center
  const labelRadius = outerRadius + 2;
  const offsetBase = labelRadius + labelOffset;

  let translateX = 0;
  let translateY = 0;
  let originX = "0%";
  let originY = "50%";

  switch (placement) {
    case "left":
      translateX = -offsetBase;
      originX = "100%";
      break;
    case "right":
      translateX = offsetBase;
      originX = "0%";
      break;
    case "top":
      translateY = -offsetBase;
      originX = "50%";
      originY = "100%";
      break;
    case "bottom":
      translateY = offsetBase;
      originX = "50%";
      originY = "0%";
      break;
    case "top-right":
      translateX = outerRadius * 0.7;
      translateY = -outerRadius * 0.7;
      originX = "0%";
      originY = "100%";
      break;
    case "top-left":
      translateX = -outerRadius * 0.7;
      translateY = -outerRadius * 0.7;
      originX = "100%";
      originY = "100%";
      break;
    case "bottom-right":
      translateX = outerRadius * 0.5;
      translateY = outerRadius * 0.5;
      originX = "0%";
      originY = "0%";
      break;
    case "bottom-left":
      translateX = -outerRadius * 0.5;
      translateY = outerRadius * 0.5;
      originX = "100%";
      originY = "0%";
      break;
    default:
      translateX = offsetBase;
  }

  for (let i = 0; i < axisCount; i++) {
    const offset = (i - (axisCount - 1) / 2) * offsetStep;

    // Horizontal
    if (horizontal) {
      // Split into left and right halves so start/end stations can dim their outer side
      const leftOpacity = isSelected ? 0.2 : opacity;
      const rightOpacity = isEndStation ? 0.2 : opacity;
      lines.push(
        <path
          key={`h-left-${i}`}
          d={`M0 ${center + offset}H${center}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={leftOpacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
        <path
          key={`h-right-${i}`}
          d={`M${center} ${center + offset}H${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={rightOpacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }
    // Vertical
    if (vertical) {
      const topOpacity = isSelected ? 0.2 : opacity;
      const bottomOpacity = isEndStation ? 0.2 : opacity;
      lines.push(
        <path
          key={`v-top-${i}`}
          d={`M${center + offset} 0V${center}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={topOpacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
        <path
          key={`v-bottom-${i}`}
          d={`M${center + offset} ${center}V${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={bottomOpacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }
    // Half Left
    if (left) {
      lines.push(
        <path
          key={`left-${i}`}
          d={`M0 ${center + offset}H${center}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={isSelected ? 0.2 : opacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }
    // Half Right
    if (right) {
      lines.push(
        <path
          key={`right-${i}`}
          d={`M${center} ${center + offset}H${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={isEndStation ? 0.2 : opacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }
    // Half Top
    if (top) {
      lines.push(
        <path
          key={`top-${i}`}
          d={`M${center + offset} 0V${center}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={isSelected ? 0.2 : opacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }
    // Half Bottom
    if (bottom) {
      lines.push(
        <path
          key={`bottom-${i}`}
          d={`M${center + offset} ${center}V${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={isEndStation ? 0.2 : opacity}
          style={{ transition: "stroke-opacity 0.3s ease" }}
        />,
      );
    }

    // Diagonals
    if (diagonalNW) {
      lines.push(
        <path
          key={`dnw-${i}`}
          d={`M${center} ${center} L0 0`}
          transform={`translate(${offset}, ${offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }
    if (diagonalNE) {
      lines.push(
        <path
          key={`dne-${i}`}
          d={`M${center} ${center} L${size} 0`}
          transform={`translate(${-offset}, ${offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }
    if (diagonalSW) {
      lines.push(
        <path
          key={`dsw-${i}`}
          d={`M${center} ${center} L0 ${size}`}
          transform={`translate(${offset}, ${-offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }
    if (diagonalSE) {
      lines.push(
        <path
          key={`dse-${i}`}
          d={`M${center} ${center} L${size} ${size}`}
          transform={`translate(${-offset}, ${-offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }

    // Full Diagonals
    if (fullDiagonal) {
      lines.push(
        <path
          key={`fd-${i}`}
          d={`M0 0 L${size} ${size}`}
          transform={`translate(${offset}, ${-offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }
    if (fullDiagonalInv) {
      lines.push(
        <path
          key={`fdi-${i}`}
          d={`M0 ${size} L${size} 0`}
          transform={`translate(${-offset}, ${offset})`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeOpacity={opacity}
        />,
      );
    }
  }

  return (
    <>
      <div
        onClick={onClick}
        style={{
          position: "absolute",
          left: typeof x === "number" ? `${x}px` : x,
          top: typeof y === "number" ? `${y}px` : y,
          cursor: onClick ? "pointer" : "default",
          zIndex: zIndex !== undefined ? zIndex : station ? 10 : 1,
          opacity: opacity,
          transition: "opacity 0.3s ease",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          {lines}
          {station && (
            <>
              <circle
                cx={center}
                cy={center}
                r={outerRadius + (isSelected || isEndStation ? 4 : 0)}
                fill={
                  isSelected
                    ? "white"
                    : isEndStation
                      ? "#93c5fd"
                      : "transparent"
                }
                style={{
                  transition: "fill 0.3s ease",
                }}
              />
              <circle
                cx={center}
                cy={center}
                r={outerRadius}
                fill={sColor}
                style={{
                  transition: "fill 0.3s ease",
                }}
              />
              {(isSelected || isEndStation) && (
                <circle
                  key={isSelected ? "sel" : "end"}
                  cx={center}
                  cy={center}
                  r={outerRadius + 4}
                  fill="none"
                  stroke={isSelected ? "white" : "#93c5fd"}
                  strokeWidth={1.5}
                  strokeOpacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from={outerRadius + 4}
                    to={outerRadius + 12}
                    dur="1.8s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    from="0.5"
                    to="0"
                    dur="1.8s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                </circle>
              )}
              {innerRadius > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={innerRadius}
                  fill={sInnerColor}
                />
              )}
            </>
          )}
        </svg>
        {children}
      </div>
      {label && (
        <div
          style={{
            position: "absolute",
            left:
              typeof x === "number"
                ? `${x + center}px`
                : `calc(${x} + ${center}px)`,
            top:
              typeof y === "number"
                ? `${y + center}px`
                : `calc(${y} + ${center}px)`,
            transform: `translate(${translateX}px, ${translateY}px) rotate(${labelRotation}deg)`,
            transformOrigin: `${originX} ${originY}`,
            display: "inline-flex",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 100,
          }}
        >
          <span
            style={{
              background: labelBg,
              color: labelColor,
              opacity: opacity,
              fontSize: labelFontSize,
              fontWeight: 500,
              lineHeight: 1,
              padding: `2px 4px`,
              borderRadius: 2,
              textShadow:
                labelBg === "transparent" || !labelBg
                  ? "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)"
                  : "none",
            }}
          >
            {label}
          </span>
        </div>
      )}
    </>
  );
}
