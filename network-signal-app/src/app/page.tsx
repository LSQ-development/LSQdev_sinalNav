"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NetworkSignalDetector } from "@/components/NetworkSignalDetector";
import { SignalStrengthIndicator } from "@/components/SignalStrengthIndicator";
import { InteractiveMap } from "@/components/InteractiveMap";
import { MY_LOCATION } from "@/utils/constants";

interface Location {
  lat: number;
  lng: number;
}

interface TrafficArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  congestionLevel: "low" | "medium" | "high";
  peakHours: string;
}

export default function NetworkSignalApp() {
  // const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  const [recommendedLocation, setRecommendedLocation] =
    useState<Location | null>(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [eta, setEta] = useState<string>("");
  const [isHighTraffic, setIsHighTraffic] = useState(false);

  const userLocation = MY_LOCATION;

  // const detector = NetworkSignalDetector({
  //   onLocationUpdate: setUserLocation,
  //   onSignalUpdate: setSignalStrength,
  //   onTowerUpdate: setNearestTower,
  //   onTrafficUpdate: setIsHighTraffic,
  //   onRecommendationUpdate: setRecommendedLocation,
  //   cellTowers,
  //   trafficAreas,
  // });

  // Start navigation
  // const startNavigation = () => {
  //   if (recommendedLocation && userLocation) {
  //     setIsNavigating(true);
  //     const distance = calculateDistance(
  //       userLocation.lat,
  //       userLocation.lng,
  //       recommendedLocation.lat,
  //       recommendedLocation.lng
  //     );
  //     const walkingSpeed = 5; // km/h
  //     const timeInMinutes = Math.round((distance / walkingSpeed) * 60);
  //     setEta(`${timeInMinutes} min`);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">my</span>
            <span className="text-green-600">Telkom</span>
          </h1>
          <h1 className="text-lg font-semibold">
            <span className="text-black-600">Welcome back, Samuel</span>
          </h1>
          <p className="text-gray-600">
            Direct users to optimal cell towers across South Africa
          </p>
        </div> */}

        <InteractiveMap
          userLocation={userLocation}
          recommendedLocation={recommendedLocation}
          signalStrength={signalStrength}
          isNavigating={isNavigating}
        />
      </div>
    </div>
  );
}
