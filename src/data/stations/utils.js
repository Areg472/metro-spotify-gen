export function processAutoStations(cityData) {
  if (!cityData.auto) {
    return cityData;
  }

  const defaultConnectorSize = cityData.defaultConnectorSize || 100;
  const processedStations = {};
  const extraConnectors = [];

  let currentY = 0;
  let visualLineIndex = 0;

  Object.entries(cityData.stations).forEach(
    ([lineName, lineData], lineIndex) => {
      let currentX = 0;
      const stationsInLine = [];
      let lineColor = null;
      let manualLabelPlacement = null;
      const shouldHaveLabelPlacement = visualLineIndex % 2 === 1;

      Object.entries(lineData).forEach(([stationKey, stationData]) => {
        if (stationKey === "color") {
          lineColor = stationData;
        } else if (stationKey === "labelPlacement") {
          manualLabelPlacement = stationData;
        } else if (stationKey !== "branch") {
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

      visualLineIndex++;

      if (lineData.branch) {
        const branchData = lineData.branch;
        const branchedStationKey = Object.keys(processedStations).find(
          (key) => processedStations[key].name === branchData.branched_station,
        );

        if (branchedStationKey) {
          const branchedStation = processedStations[branchedStationKey];
          const branchY = currentY + defaultConnectorSize;
          const extraConnectorX = branchedStation.connector.x;

          branchedStation.connector.bottom = true;

          extraConnectors.push({
            color: lineColor || branchData.color,
            top: true,
            right: true,
            x: extraConnectorX,
            y: branchY,
          });

          const branchManualLabelPlacement = branchData.labelPlacement || null;
          const branchShouldHaveLabelPlacement = visualLineIndex % 2 === 1;
          let branchX = extraConnectorX + defaultConnectorSize;
          const branchStations = Object.entries(branchData.stations);

          branchStations.forEach(([stationKey, stationData], index) => {
            const isFirst = index === 0;
            const isLast = index === branchStations.length - 1;

            processedStations[stationKey] = {
              ...stationData,
              connector: {
                color: lineColor || branchData.color || stationData.color,
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

          visualLineIndex++;
          currentY = branchY + defaultConnectorSize;
        }
      } else {
        currentY += defaultConnectorSize;
      }
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
