export function SkeletonSongListInline({ count = 5 }) {
  return (
    <div className="flex flex-col space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="flex flex-col space-y-1.5 flex-1">
            <div className="skeleton h-3.5" style={{ width: `250px` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMetroMapInline() {
  return (
    <div className="flex flex-col items-center p-10 bg-[#1a1a1a] rounded-xl shadow-2xl mt-4 w-full max-w-5xl">
      <div className="skeleton h-7 w-48 mb-8" />
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "400px" }}
      >
        <div
          className="skeleton absolute"
          style={{ left: 40, top: "45%", width: "85%", height: 8 }}
        />
        <div
          className="skeleton absolute"
          style={{ left: "72%", top: "20%", width: 8, height: "55%" }}
        />
        {[80, 200, 320, 440, 560, 680].map((x, i) => (
          <div
            key={i}
            className="skeleton rounded-full absolute"
            style={{ left: x, top: "calc(45% - 12px)", width: 24, height: 24 }}
          />
        ))}
        {[160, 260].map((y, i) => (
          <div
            key={`b-${i}`}
            className="skeleton rounded-full absolute"
            style={{ left: "calc(72% - 12px)", top: y, width: 24, height: 24 }}
          />
        ))}
        {[80, 200, 320, 440, 560, 680].map((x, i) => (
          <div
            key={`l-${i}`}
            className="skeleton absolute"
            style={{
              left: x - 10,
              top: "calc(45% - 40px)",
              width: 70,
              height: 10,
            }}
          />
        ))}
      </div>
    </div>
  );
}
