/**
 * Builds a metro graph from processed city station data and finds
 * the shortest path between any two stations using BFS.
 *
 * Stations on the same line are connected sequentially.
 * Stations sharing the same display name (transfers) are connected across lines.
 */

/**
 * Build an adjacency list graph from a processed city object.
 *
 * @param {Object} cityData – the object returned by processAutoStations
 *   cityData.stations  – { stationKey: { name, lineId, connector, … } }
 *   cityData.extraConnectors – optional array of pure connectors (no station)
 * @returns {{ adjacency: Map<string,Set<string>>, stationMap: Object }}
 */
export function buildGraph(cityData) {
  const stationMap = cityData.stations;
  const adjacency = new Map();
  const nodeMap = new Map(); // key -> node info

  // 1. Add stations to the graph
  for (const [key, s] of Object.entries(stationMap)) {
    adjacency.set(key, new Set());
    nodeMap.set(key, { ...s, key });
  }

  // 2. Add extra connectors to the graph
  const extraConnectors = cityData.extraConnectors || [];
  extraConnectors.forEach((ec, i) => {
    const key = `extra-${i}`;
    adjacency.set(key, new Set());
    nodeMap.set(key, { connector: ec, lineId: ec.lineId, key });
  });

  // 3. Connect nodes based on position and matching legs
  const allNodes = Array.from(nodeMap.values());
  const size = cityData.defaultConnectorSize || 100;

  // Infer vertical step size from coordinates if it differs from horizontal size
  const ys = Array.from(new Set(allNodes.map((n) => n.connector.y))).sort(
    (a, b) => a - b,
  );
  let vSize = size;
  for (let i = 0; i < ys.length - 1; i++) {
    const diff = ys[i + 1] - ys[i];
    if (diff > 0 && diff < vSize) {
      vSize = diff;
      break;
    }
  }

  // Group nodes by position for easy transfer and sequential connection
  const byPos = new Map();
  for (const node of allNodes) {
    const pos = `${node.connector.x},${node.connector.y}`;
    if (!byPos.has(pos)) byPos.set(pos, []);
    byPos.get(pos).push(node);
  }

  for (const node of allNodes) {
    const { x, y } = node.connector;
    const c = node.connector;

    // A node has several potential "outbound" directions based on its legs
    const directions = [];
    if (c.horizontal || c.left)
      directions.push({ dx: -size, dy: 0, leg: "left", opposite: "right" });
    if (c.horizontal || c.right)
      directions.push({ dx: size, dy: 0, leg: "right", opposite: "left" });
    if (c.vertical || c.top)
      directions.push({ dx: 0, dy: -vSize, leg: "top", opposite: "bottom" });
    if (c.vertical || c.bottom)
      directions.push({ dx: 0, dy: vSize, leg: "bottom", opposite: "top" });
    if (c.diagonalNW)
      directions.push({
        dx: -size,
        dy: -vSize,
        leg: "diagonalNW",
        opposite: "diagonalSE",
      });
    if (c.diagonalNE)
      directions.push({
        dx: size,
        dy: -vSize,
        leg: "diagonalNE",
        opposite: "diagonalSW",
      });
    if (c.diagonalSW)
      directions.push({
        dx: -size,
        dy: vSize,
        leg: "diagonalSW",
        opposite: "diagonalNE",
      });
    if (c.diagonalSE)
      directions.push({
        dx: size,
        dy: vSize,
        leg: "diagonalSE",
        opposite: "diagonalNW",
      });
    if (c.fullDiagonal) {
      directions.push({
        dx: -size,
        dy: -vSize,
        leg: "diagonalNW",
        opposite: "diagonalSE",
      });
      directions.push({
        dx: size,
        dy: vSize,
        leg: "diagonalSE",
        opposite: "diagonalNW",
      });
    }
    if (c.fullDiagonalInv) {
      directions.push({
        dx: size,
        dy: -vSize,
        leg: "diagonalNE",
        opposite: "diagonalSW",
      });
      directions.push({
        dx: -size,
        dy: vSize,
        leg: "diagonalSW",
        opposite: "diagonalNE",
      });
    }

    for (const { dx, dy, leg, opposite } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbors = byPos.get(`${nx},${ny}`);
      if (neighbors) {
        for (const neighbor of neighbors) {
          // Check if neighbor is on the same line and has the matching opposite leg
          if (neighbor.lineId === node.lineId) {
            const nc = neighbor.connector;
            const hasOpposite =
              nc[opposite] ||
              (opposite === "left" && nc.horizontal) ||
              (opposite === "right" && nc.horizontal) ||
              (opposite === "top" && nc.vertical) ||
              (opposite === "bottom" && nc.vertical) ||
              (opposite === "diagonalNW" && nc.fullDiagonal) ||
              (opposite === "diagonalSE" && nc.fullDiagonal) ||
              (opposite === "diagonalNE" && nc.fullDiagonalInv) ||
              (opposite === "diagonalSW" && nc.fullDiagonalInv);

            if (hasOpposite) {
              adjacency.get(node.key).add(neighbor.key);
              adjacency.get(neighbor.key).add(node.key);
            }
          }
        }
      }
    }

    // 4. Connect transfers (nodes at the same position, different line)
    const atSamePos = byPos.get(`${x},${y}`);
    for (const other of atSamePos) {
      if (other.key !== node.key) {
        adjacency.get(node.key).add(other.key);
        adjacency.get(other.key).add(node.key);
      }
    }
  }

  return { adjacency, stationMap: nodeMap };
}

/**
 * BFS shortest path between two station keys.
 *
 * @param {Map<string,Set<string>>} adjacency
 * @param {string} startKey
 * @param {string} endKey
 * @returns {string[]|null} ordered array of station keys on the path, or null
 */
export function bfsPath(adjacency, startKey, endKey) {
  if (startKey === endKey) return [startKey];
  if (!adjacency.has(startKey) || !adjacency.has(endKey)) return null;

  const visited = new Set([startKey]);
  const parent = new Map();
  const queue = [startKey];

  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbour of adjacency.get(current)) {
      if (visited.has(neighbour)) continue;
      visited.add(neighbour);
      parent.set(neighbour, current);
      if (neighbour === endKey) {
        // reconstruct
        const path = [];
        let node = endKey;
        while (node !== undefined) {
          path.push(node);
          node = parent.get(node);
        }
        return path.reverse();
      }
      queue.push(neighbour);
    }
  }

  return null; // unreachable
}

/**
 * Given a city's processed data and two station objects (as stored in state),
 * returns the Set of station keys that lie on the shortest path, plus the
 * Set of lineIds used along that path.
 *
 * @param {Object} cityData – processed city data (from stations[cityId])
 * @param {Object} startStation – { name, lineId, connector: {x, y, …}, … }
 * @param {Object} endStation   – same shape
 * @returns {{ pathKeys: Set<string>, pathLineIds: Set<string> } | null}
 */
export function findHighlightPath(cityData, startStation, endStation) {
  if (!cityData || !startStation || !endStation) return null;

  const { adjacency, stationMap } = buildGraph(cityData);

  // Resolve station objects to their keys.
  const entries = Array.from(stationMap.entries());

  const findKey = (stObj) => {
    // Identity match first
    for (const [key, s] of entries) {
      if (s === stObj) return key;
    }
    // Fallback: match by name + lineId + position
    for (const [key, s] of entries) {
      if (
        s.name === stObj.name &&
        s.lineId === stObj.lineId &&
        s.connector.x === stObj.connector.x &&
        s.connector.y === stObj.connector.y
      ) {
        return key;
      }
    }
    // Last-resort: match by name only (first hit)
    for (const [key, s] of entries) {
      if (s.name === stObj.name) return key;
    }
    return null;
  };

  const startKey = findKey(startStation);
  const endKey = findKey(endStation);

  if (!startKey || !endKey) return null;

  const path = bfsPath(adjacency, startKey, endKey);
  if (!path) {
    // Fallback: highlight both entire lines when no route is found
    const startLineId = stationMap.get(startKey).lineId;
    const endLineId = stationMap.get(endKey).lineId;
    const fallbackLineIds = new Set([startLineId, endLineId]);
    const fallbackKeys = new Set();
    const fallbackLegs = new Map();

    for (const [key, node] of stationMap.entries()) {
      if (fallbackLineIds.has(node.lineId)) {
        fallbackKeys.add(key);
        // Keep all original legs active for stations on these lines
        const legs = new Set();
        const c = node.connector;
        if (c.horizontal || c.left) legs.add("left");
        if (c.horizontal || c.right) legs.add("right");
        if (c.vertical || c.top) legs.add("top");
        if (c.vertical || c.bottom) legs.add("bottom");
        if (c.diagonalNW || c.fullDiagonal) legs.add("diagonalNW");
        if (c.diagonalSE || c.fullDiagonal) legs.add("diagonalSE");
        if (c.diagonalNE || c.fullDiagonalInv) legs.add("diagonalNE");
        if (c.diagonalSW || c.fullDiagonalInv) legs.add("diagonalSW");
        fallbackLegs.set(key, legs);
      }
    }

    return {
      pathKeys: fallbackKeys,
      pathLineIds: fallbackLineIds,
      pathStationKeys: Array.from(fallbackKeys),
      activeLegs: fallbackLegs,
    };
  }

  const pathKeys = new Set(path);
  const pathLineIds = new Set();
  const activeLegs = new Map(); // nodeKey -> Set of leg names

  for (let i = 0; i < path.length; i++) {
    const currentKey = path[i];
    const currentNode = stationMap.get(currentKey);
    pathLineIds.add(currentNode.lineId);

    const legs = new Set();
    const neighborsOnPath = [];
    if (i > 0) neighborsOnPath.push(path[i - 1]);
    if (i < path.length - 1) neighborsOnPath.push(path[i + 1]);

    for (const neighborKey of neighborsOnPath) {
      const neighborNode = stationMap.get(neighborKey);
      if (
        neighborNode.connector.x === currentNode.connector.x &&
        neighborNode.connector.y === currentNode.connector.y
      ) {
        // Transfer - no leg needed
        continue;
      }

      const dx = neighborNode.connector.x - currentNode.connector.x;
      const dy = neighborNode.connector.y - currentNode.connector.y;

      if (dy === 0) {
        if (dx < 0) legs.add("left");
        else if (dx > 0) legs.add("right");
      } else if (dx === 0) {
        if (dy < 0) legs.add("top");
        else if (dy > 0) legs.add("bottom");
      } else {
        // Diagonals
        if (dx < 0 && dy < 0) legs.add("diagonalNW");
        else if (dx > 0 && dy < 0) legs.add("diagonalNE");
        else if (dx < 0 && dy > 0) legs.add("diagonalSW");
        else if (dx > 0 && dy > 0) legs.add("diagonalSE");
      }
    }
    activeLegs.set(currentKey, legs);
  }

  // Determine if the entire path stays on a single line
  const isSingleLine = pathLineIds.size === 1;

  // Estimate trip duration: ~2.5 minutes per inter-station segment
  // Transfers (same position, different line) don't count as a segment but add ~3 min
  let segments = 0;
  let transfers = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = stationMap.get(path[i]);
    const b = stationMap.get(path[i + 1]);
    if (a.connector.x === b.connector.x && a.connector.y === b.connector.y) {
      transfers++;
    } else {
      segments++;
    }
  }
  const estimatedMinutes = segments * 2.5 + transfers * 3;

  // Collect ordered coordinates for animation
  const pathCoords = path.map((key) => {
    const node = stationMap.get(key);
    return { x: node.connector.x, y: node.connector.y, key };
  });

  return {
    pathKeys,
    pathLineIds,
    pathStationKeys: path,
    activeLegs,
    isSingleLine,
    estimatedMinutes,
    pathCoords,
  };
}
