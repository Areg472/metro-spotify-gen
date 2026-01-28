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
  onClick,
  isSelected = false,
  isEndStation = false,
  children,
}) {
  const lines = [];
  const offsetStep = thickness * 2;
  const center = size / 2;

  const outerRadius = 15;
  const sColor = stationColor || color;
  const sInnerColor = stationInnerColor || "none";
  const innerRadius =
    sInnerColor !== "none" && sInnerColor !== sColor
      ? outerRadius - thickness / 2
      : 0;

  for (let i = 0; i < axisCount; i++) {
    const offset = (i - (axisCount - 1) / 2) * offsetStep;

    // Horizontal
    if (horizontal) {
      lines.push(
        <path
          key={`h-${i}`}
          d={`M0 ${center + offset}H${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
        />,
      );
    }
    // Vertical
    if (vertical) {
      lines.push(
        <path
          key={`v-${i}`}
          d={`M${center + offset} 0V${size}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
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
        />,
      );
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: typeof x === "number" ? `${x}px` : x,
        top: typeof y === "number" ? `${y}px` : y,
        cursor: onClick ? "pointer" : "default",
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
                isSelected ? "white" : isEndStation ? "#93c5fd" : "transparent"
              }
            />
            <circle cx={center} cy={center} r={outerRadius} fill={sColor} />
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
  );
}
