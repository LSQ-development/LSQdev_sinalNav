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
