export const generateShareImage = ({
  hasValidTracks,
  selectedCity,
  startStation,
  endStation,
  isSingleLine,
  stationCount,
  messages,
  mapImage,
}) => {
  if (!hasValidTracks) return;
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Background black
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 1920, 1080);

  // Headers centered
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Calibri, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${selectedCity?.name} Metro Journey`, 960, 100);

  // Treat long single-line routes (11+ stations) as multi-line
  const effectiveSingleLine = isSingleLine && stationCount < 11;

  // Draw Map or Station text in center
  if (mapImage) {
    const maxW = effectiveSingleLine ? 1750 : 800;
    const maxH = effectiveSingleLine ? 450 : 200;
    const scale = Math.min(maxW / mapImage.width, maxH / mapImage.height);
    const dw = mapImage.width * scale;
    const dh = mapImage.height * scale;
    const dx = (1920 - dw) / 2;
    const dy = 140 + (maxH - dh) / 2;
    ctx.drawImage(mapImage, dx, dy, dw, dh);

    if (!effectiveSingleLine) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 40px Calibri, sans-serif";
      ctx.fillText(`${startStation?.name} ➔ ${endStation?.name}`, 960, 400);
    }
  } else {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "bold 60px Calibri, sans-serif";
    ctx.fillText(`${startStation?.name} ➔ ${endStation?.name}`, 960, 320);
  }

  const tracks = messages
    .filter((m) => Array.isArray(m.content))
    .flatMap((m) => m.content);

  // Tracklist on the left/below map
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 50px Calibri, sans-serif";
  ctx.fillText("Tracklist", 120, 560);

  ctx.font = "40px Calibri, sans-serif";
  let y = 620;
  let x = 120;

  tracks.slice(0, 16).forEach((track, i) => {
    if (i === 8) {
      x = 1000;
      y = 620;
    }

    ctx.fillStyle = "#ffffff";
    const num = `${i + 1}.`;
    ctx.fillText(num, x, y);

    const offset = ctx.measureText("10. ").width;

    const title = track.title;
    ctx.fillText(title, x + offset, y);

    const tWidth = ctx.measureText(title).width;
    ctx.fillStyle = "#9ca3af";

    const artist = track.artist;
    ctx.fillText(` - ${artist}`, x + offset + tWidth, y);

    y += 45;
  });

  if (tracks.length > 16) {
    ctx.fillStyle = "#6b7280";
    ctx.fillText(`+ ${tracks.length - 16} more tracks...`, x, y);
  }

  // Branding / Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#475569";
  ctx.font = "bold 30px Calibri, sans-serif";
  ctx.fillText("made by Areg, quack", 960, 1040);

  // Download image
  const link = document.createElement("a");
  link.download = `${selectedCity?.name}_Metro_Journey.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
};

