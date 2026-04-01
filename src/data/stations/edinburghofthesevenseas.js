const adjectives = [
  "North",
  "South",
  "East",
  "West",
  "Central",
  "Upper",
  "Lower",
  "Old",
  "New",
  "Royal",
  "Grand",
  "Little",
  "Great",
  "Inner",
  "Outer",
  "High",
  "Deep",
  "Far",
  "Near",
  "Long",
];
const nouns = [
  "Harbour",
  "Cliff",
  "Ridge",
  "Bay",
  "Point",
  "Cove",
  "Landing",
  "Gate",
  "Hill",
  "Rock",
  "Shore",
  "Pier",
  "Crossing",
  "Green",
  "Square",
  "Bluff",
  "Pass",
  "Hollow",
  "Wharf",
  "Peak",
];

function randomLabel(usedNames) {
  let name;
  do {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    name = `${adj} ${noun}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function toKey(name) {
  const stripped = name.replace(/\s+/g, "");
  return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

export function generateEdinburghStations() {
  const maxTotal = 10;
  const line1Count = Math.floor(Math.random() * 4) + 4; // 4-7
  const line2Count = maxTotal - line1Count; // remainder so total is always 10

  const step = 60;
  const maxXSlots = 480 / step; // 8 → positions 0, 60, 120, …, 480
  const maxYSlots = 60 / step; // 1 → positions 0, 60
  const lineColors = ["#4a90d9", "#e85d75"];
  const usedNames = new Set();
  const usedPositions = new Set();
  const stations = {};

  [line1Count, line2Count].forEach((count, lineIdx) => {
    const color = lineColors[lineIdx];
    for (let i = 0; i < count; i++) {
      const name = randomLabel(usedNames);
      const key = toKey(name) + "_" + lineIdx + "_" + i;

      let xSlot, ySlot, posKey;
      do {
        xSlot = Math.floor(Math.random() * (maxXSlots + 1));
        ySlot = Math.floor(Math.random() * (maxYSlots + 1));
        posKey = `${xSlot},${ySlot}`;
      } while (usedPositions.has(posKey));
      usedPositions.add(posKey);

      stations[key] = {
        name,
        lineId: color,
        connector: {
          color,
          station: true,
          x: xSlot * step,
          y: ySlot * step,
          ...(lineIdx % 2 === 1 ? { labelPlacement: "bottom-right" } : {}),
        },
      };
    }
  });

  // Adjacency pass: detect stations that are exactly one step apart and
  // set connector ends so they visually attach to each other.
  const posMap = {};
  const stationKeys = Object.keys(stations);
  for (const key of stationKeys) {
    const { x, y } = stations[key].connector;
    posMap[`${x},${y}`] = key;
  }

  for (const key of stationKeys) {
    const c = stations[key].connector;
    const { x, y } = c;
    const hasRight = !!posMap[`${x + step},${y}`];
    const hasLeft = !!posMap[`${x - step},${y}`];
    const hasBottom = !!posMap[`${x},${y + step}`];
    const hasTop = !!posMap[`${x},${y - step}`];
    const hasNW = !!posMap[`${x - step},${y - step}`];
    const hasNE = !!posMap[`${x + step},${y - step}`];
    const hasSW = !!posMap[`${x - step},${y + step}`];
    const hasSE = !!posMap[`${x + step},${y + step}`];

    if (hasLeft && hasRight) {
      c.horizontal = true;
    } else if (hasLeft) {
      c.left = true;
    } else if (hasRight) {
      c.right = true;
    }

    if (hasTop && hasBottom) {
      c.vertical = true;
    } else if (hasTop) {
      c.top = true;
    } else if (hasBottom) {
      c.bottom = true;
    }

    if (hasNW) c.diagonalNW = true;
    if (hasNE) c.diagonalNE = true;
    if (hasSW) c.diagonalSW = true;
    if (hasSE) c.diagonalSE = true;
  }

  return {
    name: "Edinburgh of the Seven Seas",
    country: "Saint Helena",
    defaultConnectorSize: 60,
    disableTracklist: true,
    stations,
  };
}

export const edinburghOfTheSevenSeas = generateEdinburghStations();
