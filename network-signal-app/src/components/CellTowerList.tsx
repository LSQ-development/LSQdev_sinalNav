import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CellTower,
  Location,
  CellTowerApiResponse,
  ApiError,
} from "../../types/opencellid";
import { useState, useCallback, useMemo } from "react";
import { API_CONFIG } from "@/utils/constants";

interface CellTowerListProps {
  cellTowers: CellTower[];
}

interface CellTowersPageProps {
  initialLocation?: Location;
}

export function CellTowerList({ initialLocation }: CellTowersPageProps) {
  const [towers, setTowers] = useState<CellTower[]>([]);
  const [radius, setRadius] = useState<number>(API_CONFIG.DEFAULT_RADIUS);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<Location>(
    initialLocation || { lat: "", lng: "" }
  );

  const getCurrentLocation = useCallback((): void => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
        });
        setLoading(false);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  // const fetchTowers = useCallback(async (): Promise<void> => {
  //   if (!location.lat || !location.lng) {
  //     setError("Please provide location coordinates");
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       `/api/open-cell?lat=${encodeURIComponent(
  //         location.lat
  //       )}&lon=${encodeURIComponent(location.lng)}&radius=${radius}`
  //     );

  //     if (!response.ok) {
  //       const errorData: ApiError = await response.json();
  //       throw new Error(errorData.error || `HTTP ${response.status}`);
  //     }

  //     const data: CellTowerApiResponse = await response.json();
  //     setTowers(data.towers);

  //     if (data.towers.length === 0) {
  //       setError(
  //         "No cell towers found in the specified area. Try increasing the radius."
  //       );
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Failed to fetch cell towers";
  //     setError(errorMessage);
  //     setTowers([]);
  //   }
  // }, [location.lat, location.lng, radius]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Nearby Cell Towers (South Africa)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
        </div>
        <div>
          <button
            className="cursor-pointer"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            {loading ? "Getting Location..." : "Use My Location"}
          </button>
          {/* <button onClick={fetchTowers} disabled={loading}>
            {loading ? "Loading" : "Find Cell Towers"}
          </button> */}
        </div>
        {towers.length > 0 &&
          towers.map((tower, index) => (
            <p key={`${tower.id}-${index}`}>
              {" "}
              Distance: {tower.distance.toFixed(2)} km
            </p>
          ))}
      </CardContent>
    </Card>
  );
}

{
  /* {cellTowers.map((tower) => {
            const loadPercentage = Math.round((tower.currentLoad / tower.capacity) * 100)
            const loadColor =
              loadPercentage > 80 ? "text-red-600" : loadPercentage > 60 ? "text-yellow-600" : "text-green-600"

            return (
              <div key={tower.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">{tower.carrier}</div>
                    <div className="text-sm text-gray-500">
                      {tower.frequency} | ID: {tower.id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tower.strength}%</div>
                  <div className="text-xs text-gray-500">Signal</div>
                  <div className={`text-xs ${loadColor}`}>Load: {loadPercentage}%</div>
                </div>
              </div>
            )
          })} */
}
