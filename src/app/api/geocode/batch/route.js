const serverCache = {
  amsterdam: [52.3676, 4.9041],
  beijing: [39.9042, 116.4074],
  berlin: [52.52, 13.405],
  boston: [42.3601, -71.0589],
  chicago: [41.8781, -87.6298],
  delhi: [28.6139, 77.209],
  edinburghOfTheSevenSeas: [-37.068, -12.3154],
  istanbul: [41.0082, 28.9784],
  london: [51.5074, -0.1278],
  losAngeles: [34.0522, -118.2437],
  lyon: [45.764, 4.8357],
  minsk: [53.9045, 27.5615],
  moscow: [55.7558, 37.6173],
  nanjing: [32.0603, 118.7969],
  naples: [40.8518, 14.2681],
  newyorkcity: [40.7128, -74.006],
  paris: [48.8566, 2.3522],
  saintPetersburg: [59.9343, 30.3351],
  tashkent: [41.2995, 69.2401],
  tbilisi: [41.6938, 44.8015],
  tehran: [35.6892, 51.389],
  tokyo: [35.6762, 139.6503],
  toronto: [43.6532, -79.3832],
  washington: [38.9072, -77.0369],
  yerevan: [40.1872, 44.5152],
};

async function geocodeOne(name, country) {
  const query = country ? `${name}, ${country}` : name;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "metro-spotify-gen/1.0" },
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

export async function POST(request) {
  const cities = await request.json(); // [{id, name, country}]

  const uncached = cities.filter((c) => !serverCache[c.id]);
  const cached = cities.filter((c) => serverCache[c.id]);

  // Fetch uncached cities in batches of 5 with 250ms between batches
  const BATCH_SIZE = 5;
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (c) => {
        try {
          const coords = await geocodeOne(c.name, c.country);
          if (coords) serverCache[c.id] = coords;
        } catch {
          // skip
        }
      }),
    );
    if (i + BATCH_SIZE < uncached.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  const result = {};
  for (const c of [...cached, ...uncached]) {
    if (serverCache[c.id]) result[c.id] = serverCache[c.id];
  }

  return Response.json(result);
}
