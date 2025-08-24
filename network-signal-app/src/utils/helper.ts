import { Tower } from "@/types/Tower";
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
function congestionRank(c: string | undefined) {
  switch (c?.toLowerCase()) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    default:
      return 4;
  }
}
export const calculateDistance = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((long2 - long1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const getClosestCellTowers = async () => {
  const res = await fetch(`/api/towers?lat=-33.931782&lon=18.627961`);

  const data = await res.json();
  console.log(data);
  return data;
};

//if this returns null, send user prompt to say "switching on Roaming then find other networks"
export const getBestCellTower = (
  userLat: number,
  userLon: number,
  towers: Tower[],
  isRoaming: boolean
) => {
  let candidates = towers;

  // Step 1: prioritise Telkom towers (MNC = 2)
  candidates = candidates.filter((t) => t.MNC === 2);

  if (!isRoaming && candidates.length === 0) return null;

  // Step 2: scoring
  const scored = candidates.map((t) => {
    const distance = haversine(userLat, userLon, t.Latitude, t.Longitude);

    // Radio type scoring
    // LTE is strong → base score boost
    // UMTS is still valid → lower but still acceptable
    let radioScore = 0;
    if (t.Radio_Type === "LTE") radioScore = 3;
    else if (t.Radio_Type === "UMTS") radioScore = 2;
    else if (t.Radio_Type === "GSM") radioScore = 1;

    // Congestion scoring
    const congestion = (t.Traffic || "medium").toLowerCase();
    let congestionScore = 0;
    if (congestion === "low") congestionScore = 3;
    else if (congestion === "medium") congestionScore = 2;
    else if (congestion === "high") congestionScore = 1;

    /**
     * Composite scoring:
     * - RadioType weighted heavily (LTE robustness even under medium congestion)
     * - Congestion weighted next
     * - Distance is a penalty (closer towers preferred)
     */
    const score = radioScore * 1000 + congestionScore * 200 - distance / 10;

    return { ...t, distance, score };
  });

  // Step 3: sort by score
  scored.sort((a, b) => b.score - a.score);

  return scored[0];
};
