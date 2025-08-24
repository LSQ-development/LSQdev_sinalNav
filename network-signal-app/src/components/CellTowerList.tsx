import { Tower } from "@/types/Tower";
import React, { useEffect, useState } from "react";

const CellTowerList = () => {
  const [towers, setTowers] = useState<Tower[]>([]);

  const myLocation = { lat: -33.931782, lon: 18.627961 };

  useEffect(() => {
    async function fetchTowers() {
      const res = await fetch(
        `/api/towers?lat=${myLocation.lat}&lon=${myLocation.lon}`
      );
      const data = await res.json();
      console.log(data);
      setTowers(data);
    }
    fetchTowers();
  }, []);
  return <div>CellTowerList</div>;
};

export default CellTowerList;
