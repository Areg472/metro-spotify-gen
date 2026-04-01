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
  const maxTotal = 12;
  const line1Count = Math.floor(Math.random() * 5) + 4; // 4-8
  const line2Count = Math.min(
    maxTotal - line1Count,
    Math.floor(Math.random() * 5) + 3,
  ); // 3-7, capped

  const step = 60;
  const maxXSlots = 300 / step; // 5 → positions 0, 60, 120, …, 300
  const maxYSlots = 180 / step; // 3  → positions 0, 60, 120, 180
  const lineColors = ["#4a90d9", "#e85d75"];
  const usedNames = new Set();
  const usedPositions = new Set();
  const stations = {};

  [line1Count, line2Count].forEach((count, lineIdx) => {
    const color = lineColors[lineIdx];
    for (let i = 0; i < count; i++) {
      const name = randomLabel(usedNames);
      const key = toKey(name) + "_" + lineIdx + "_" + i;
      const isFirst = i === 0;
      const isLast = i === count - 1;

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
          ...(isFirst ? { right: true } : {}),
          ...(isLast ? { left: true } : {}),
          ...(!isFirst && !isLast ? { horizontal: true } : {}),
          ...(lineIdx % 2 === 1 ? { labelPlacement: "bottom-right" } : {}),
        },
      };
    }
  });

  return {
    name: "Edinburgh of the Seven Seas",
    country: "Saint Helena",
    defaultConnectorSize: 60,
    disableTracklist: true,
    stations,
  };
}

export const edinburghOfTheSevenSeas = generateEdinburghStations();
