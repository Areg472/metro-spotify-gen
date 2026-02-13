function processBranch(
  branchData,
  parentLineColor,
  processedStations,
  extraConnectors,
  defaultConnectorSize,
  visualLineIndexRef,
  branchOffsetMap = {},
  branchIndex = 0,
  totalBranches = 1,
) {
  const branchedStationKey = Object.keys(processedStations).find(
    (key) => processedStations[key].name === branchData.branched_station,
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
    parentY + defaultConnectorSize * branchOffsetMap[branchedStationKey];
  const extraConnectorX = branchedStation.connector.x;

  branchedStation.connector.bottom = true;

  const isLastBranch = branchIndex === totalBranches - 1;

  extraConnectors.push({
    color: parentLineColor || branchData.color,
    ...(isLastBranch ? { top: true } : { vertical: true }),
    right: true,
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
      connector: {
        color: parentLineColor || branchData.color || data.color,
        station: true,
        x: branchX,
        y: branchY,
        ...(isFirst ? { horizontal: true } : {}),
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

  const defaultConnectorSize = cityData.defaultConnectorSize || 100;
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
          visualLineIndexRef,
          branchOffsetMap,
        );
        if (branchResult) {
          maxY = Math.max(maxY, branchResult);
        }
      }

      if (lineData.branches) {
        lineData.branches.forEach((branchData, index) => {
          const branchResult = processBranch(
            branchData,
            lineColor,
            processedStations,
            extraConnectors,
            defaultConnectorSize,
            visualLineIndexRef,
            branchOffsetMap,
            index,
            lineData.branches.length,
          );
          if (branchResult) {
            maxY = Math.max(maxY, branchResult);
          }
        });
      }

      currentY = maxY + defaultConnectorSize;
    },
  );

  return {
    name: cityData.name,
    country: cityData.country,
    defaultConnectorSize: cityData.defaultConnectorSize,
    stations: processedStations,
    ...(extraConnectors.length > 0 ? { extraConnectors } : {}),
  };
}
