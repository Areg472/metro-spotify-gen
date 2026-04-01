function processBranch(
  branchData,
  parentLineColor,
  processedStations,
  extraConnectors,
  defaultConnectorSize,
  verticalConnectorSize,
  visualLineIndexRef,
  branchOffsetMap = {},
  branchIndex = 0,
  totalBranches = 1,
) {
  const targetName = branchData.branchedStation || branchData.branched_station;
  const branchedStationKey =
    Object.keys(processedStations).find(
      (key) =>
        processedStations[key].name === targetName &&
        processedStations[key].lineId === parentLineColor,
    ) ||
    Object.keys(processedStations).find(
      (key) => processedStations[key].name === targetName,
    );

  if (!branchedStationKey) {
    return null;
  }

  const branchedStation = processedStations[branchedStationKey];
  const parentY = branchedStation.connector.y;

  if (!branchOffsetMap[branchedStationKey]) {
    branchOffsetMap[branchedStationKey] = 0;
  }
  branchOffsetMap[branchedStationKey]++;

  const branchY =
    parentY + verticalConnectorSize * branchOffsetMap[branchedStationKey];
  const extraConnectorX = branchedStation.connector.x;

  branchedStation.connector.bottom = true;

  const isLastBranch = branchIndex === totalBranches - 1;

  const branchStationCount = Object.keys(branchData.stations || {}).filter(
    (k) => k !== "branch" && k !== "branches",
  ).length;

  extraConnectors.push({
    color: parentLineColor || branchData.color,
    lineId: parentLineColor || branchData.color,
    ...(isLastBranch ? { top: true, right: true } : { vertical: true }),
    ...(branchStationCount > 1 ? { right: true } : {}),
    x: extraConnectorX,
    y: branchY,
  });

  const branchManualLabelPlacement = branchData.labelPlacement || null;
  const branchShouldHaveLabelPlacement = visualLineIndexRef.value % 2 === 1;
  let branchX = extraConnectorX + defaultConnectorSize;
  const branchStations = [];

  Object.entries(branchData.stations || {}).forEach(
    ([stationKey, stationData]) => {
      if (stationKey !== "branch" && stationKey !== "branches") {
        branchStations.push({ key: stationKey, data: stationData });
      }
    },
  );

  branchStations.forEach((station, index) => {
    const { key, data } = station;
    const isFirst = index === 0;
    const isLast = index === branchStations.length - 1;

    processedStations[key] = {
      ...data,
      lineId: branchData.color || parentLineColor,
      connector: {
        color: parentLineColor || branchData.color || data.color,
        station: true,
        x: branchX,
        y: branchY,
        ...(isFirst && !isLast ? { horizontal: true } : {}),
        ...(isLast ? { left: true } : {}),
        ...(!isFirst && !isLast ? { horizontal: true } : {}),
        ...(branchManualLabelPlacement
          ? { labelPlacement: branchManualLabelPlacement }
          : branchShouldHaveLabelPlacement
            ? { labelPlacement: "bottom-right" }
            : {}),
      },
    };

    branchX += defaultConnectorSize;
  });

  visualLineIndexRef.value++;

  let maxBranchY = branchY;

  if (branchData.branch) {
    const nestedResult = processBranch(
      branchData.branch,
      parentLineColor || branchData.color,
      processedStations,
      extraConnectors,
      defaultConnectorSize,
      verticalConnectorSize,
      visualLineIndexRef,
      branchOffsetMap,
    );
    if (nestedResult) {
      maxBranchY = Math.max(maxBranchY, nestedResult);
    }
  }

  if (branchData.branches) {
    branchData.branches.forEach((nestedBranch) => {
      const nestedResult = processBranch(
        nestedBranch,
        parentLineColor || branchData.color,
        processedStations,
        extraConnectors,
        defaultConnectorSize,
        verticalConnectorSize,
        visualLineIndexRef,
        branchOffsetMap,
        0,
        1,
      );
      if (nestedResult) {
        maxBranchY = Math.max(maxBranchY, nestedResult);
      }
    });
  }

  return maxBranchY;
}

export function processAutoStations(cityData) {
  if (!cityData.auto) {
    return cityData;
  }

  const isNewYork = cityData.name === "New York City";
  const isFrench = cityData.name === "Lyon" || "Paris";
  const defaultConnectorSize = cityData.defaultConnectorSize || 100;
  const verticalConnectorSize = isNewYork ? 80 : defaultConnectorSize;
  const processedStations = {};
  const extraConnectors = [];

  let currentY = 0;
  const visualLineIndexRef = { value: 0 };

  Object.entries(cityData.stations).forEach(
    ([lineName, lineData], lineIndex) => {
      let currentX = 0;
      const stationsInLine = [];
      let lineColor = null;
      let manualLabelPlacement = null;
      const shouldHaveLabelPlacement = visualLineIndexRef.value % 2 === 1;

      Object.entries(lineData).forEach(([stationKey, stationData]) => {
        if (stationKey === "color") {
          lineColor = stationData;
        } else if (stationKey === "labelPlacement") {
          manualLabelPlacement = stationData;
        } else if (stationKey !== "branch" && stationKey !== "branches") {
          stationsInLine.push({ key: stationKey, data: stationData });
        }
      });

      stationsInLine.forEach((station, index) => {
        const { key, data } = station;
        const isFirst = index === 0;
        const isLast = index === stationsInLine.length - 1;

        processedStations[key] = {
          ...data,
          lineId: lineColor || data.color,
          connector: {
            color: lineColor || data.color,
            station: true,
            x: currentX,
            y: currentY,
            ...(isFirst ? { right: true } : {}),
            ...(isLast ? { left: true } : {}),
            ...(!isFirst && !isLast ? { horizontal: true } : {}),
            ...(manualLabelPlacement
              ? { labelPlacement: manualLabelPlacement }
              : shouldHaveLabelPlacement
                ? { labelPlacement: "bottom-right" }
                : {}),
          },
        };

        currentX += defaultConnectorSize;
      });

      visualLineIndexRef.value++;

      let maxY = currentY;

      const branchOffsetMap = {};

      if (lineData.branch) {
        const branchResult = processBranch(
          lineData.branch,
          lineColor,
          processedStations,
          extraConnectors,
          defaultConnectorSize,
          verticalConnectorSize,
          visualLineIndexRef,
          branchOffsetMap,
        );
        if (branchResult) {
          maxY = Math.max(maxY, branchResult);
        }
      }

      if (lineData.branches) {
        // Pre-compute last index per parent station name so connectors cap correctly
        const lastIndexForParent = {};
        lineData.branches.forEach((branchData, index) => {
          const parentName =
            branchData.branchedStation || branchData.branched_station;
          lastIndexForParent[parentName] = index;
        });

        lineData.branches.forEach((branchData, index) => {
          const parentName =
            branchData.branchedStation || branchData.branched_station;
          const isLastForParent = lastIndexForParent[parentName] === index;
          const branchResult = processBranch(
            branchData,
            lineColor,
            processedStations,
            extraConnectors,
            defaultConnectorSize,
            verticalConnectorSize,
            visualLineIndexRef,
            branchOffsetMap,
            isLastForParent ? 0 : -1,
            1,
          );
          if (branchResult) {
            maxY = Math.max(maxY, branchResult);
          }
        });
      }

      currentY = maxY + verticalConnectorSize;
    },
  );

  if (isFrench) {
    Object.values(processedStations).forEach((s) => {
      if (s.connector) s.connector.y += 30;
    });
    extraConnectors.forEach((c) => {
      c.y += 30;
    });
  }

  return {
    name: cityData.name,
    country: cityData.country,
    defaultConnectorSize: cityData.defaultConnectorSize,
    stations: processedStations,
    ...(extraConnectors.length > 0 ? { extraConnectors } : {}),
    ...(cityData.disableTracklist ? { disableTracklist: true } : {}),
  };
}
