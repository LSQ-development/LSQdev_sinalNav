"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NetworkSignalDetector } from "@/components/NetworkSignalDetector";
import { SignalStrengthIndicator } from "@/components/SignalStrengthIndicator";
import { InteractiveMap } from "@/components/InteractiveMap";
import { MY_LOCATION } from "@/utils/constants";
import { NavBar } from "@/components/NavBar";

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
  const [signalStrength, setSignalStrength] = useState(0);
  const [recommendedLocation, setRecommendedLocation] =
    useState<Location | null>(null);

  const [isNavigating, setIsNavigating] = useState(false);
  const [eta, setEta] = useState<string>("");
  const [isHighTraffic, setIsHighTraffic] = useState(false);

  const [userLocation, setUserLocation] = useState<Location | null>();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">my</span>
            <span className="text-green-600">Telkom</span>
          </h1>
          <h1 className="text-lg font-semibold">
            <span className="text-black-600">Welcome back, Samuel</span>
          </h1>
        </div>
        {userLocation && (
          <InteractiveMap
            userLocation={userLocation}
            recommendedLocation={recommendedLocation}
            signalStrength={signalStrength}
            isNavigating={isNavigating}
          />
        )}
        <NavBar />
      </div>
    </div>
  );
}
