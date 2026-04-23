"use client";

export function PlaylistExport({
  selectedCity,
  messages,
  showExportCheckbox,
  setShowExportCheckbox,
  confirmHasFiles,
  setConfirmHasFiles,
}) {
  const handleExportClick = () => {
    if (!showExportCheckbox) {
      setShowExportCheckbox(true);
      return;
    }
    if (confirmHasFiles) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "audio/*";
      input.onchange = () => {
        const selectedFiles = Array.from(input.files);
        const musicFiles = selectedFiles.map((f) => f.name);
        const tracks = messages
          .filter((m) => Array.isArray(m.content))
          .flatMap((m) => m.content);
        let m3u = `#EXTM3U\n#PLAYLIST:Metro Playlist [${selectedCity?.name || "Unknown"}]\n`;
        let matchedCount = 0;
        tracks.forEach((track) => {
          const titleLower = track.title.toLowerCase();
          const matched = musicFiles.find((f) =>
            f.toLowerCase().includes(titleLower),
          );
          if (matched) {
            matchedCount++;
            m3u += `#EXTINF:-1,${track.artist} - ${track.title}\n`;
            m3u += `${matched}\n`;
          }
        });
        if (matchedCount === 0) {
          alert(
            "No matching files found in the selected folder for any of the tracks.",
          );
          return;
        }
        const blob = new Blob([m3u], {
          type: "audio/x-mpegurl",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Metro Playlist [${selectedCity?.name || "Unknown"}].m3u`;
        a.click();
        URL.revokeObjectURL(url);
      };
      input.click();
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <button
        onClick={handleExportClick}
        className="w-fit px-5 py-2 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700"
      >
        Export as M3U Playlist
      </button>
      {showExportCheckbox && (
        <label className="flex items-center gap-2 text-white cursor-pointer">
          <input
            type="checkbox"
            checked={confirmHasFiles}
            onChange={(e) => setConfirmHasFiles(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm">
            I confirm that I have the audio files for these songs and will
            upload them by clicking the button above
          </span>
        </label>
      )}
    </div>
  );
}
