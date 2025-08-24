"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NetworkSignalDetector } from "@/components/NetworkSignalDetector";
import { SignalStrengthIndicator } from "@/components/SignalStrengthIndicator";
import { InteractiveMap } from "@/components/InteractiveMap";
import { NavigationPanel } from "@/components/NavigationPanel";
import { SafeLandmarksList } from "@/components/SafeLandmarksList";
import CellTowerList from "@/components/CellTowerList";
// import { CellTowerList } from "@/components/CellTowerList"

interface Location {
  lat: number;
  lng: number;
}

interface CellTower {
  id: string;
  lat: number;
  lng: number;
  carrier: string;
  strength: number;
  frequency: string;
  capacity: number;
  currentLoad: number;
}

interface SafeLandmark {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  rating: number;
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
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  const [recommendedLocation, setRecommendedLocation] =
    useState<Location | null>(null);
  const [nearestTower, setNearestTower] = useState<CellTower | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [eta, setEta] = useState<string>("");
  const [isHighTraffic, setIsHighTraffic] = useState(false);

  const cellTowers: CellTower[] = [
    {
      id: "1",
      lat: -33.9249,
      lng: 18.4241,
      carrier: "Vodacom",
      strength: 85,
      frequency: "5G",
      capacity: 1000,
      currentLoad: 650,
    },
    {
      id: "2",
      lat: -33.918,
      lng: 18.4292,
      carrier: "MTN",
      strength: 78,
      frequency: "4G LTE",
      capacity: 800,
      currentLoad: 720,
    },
    {
      id: "3",
      lat: -33.932,
      lng: 18.41,
      carrier: "Cell C",
      strength: 92,
      frequency: "5G",
      capacity: 1200,
      currentLoad: 400,
    },
    {
      id: "4",
      lat: -33.915,
      lng: 18.435,
      carrier: "Telkom",
      strength: 88,
      frequency: "4G LTE",
      capacity: 900,
      currentLoad: 550,
    },
    {
      id: "5",
      lat: -33.928,
      lng: 18.418,
      carrier: "Vodacom",
      strength: 82,
      frequency: "5G",
      capacity: 1100,
      currentLoad: 800,
    },
  ];

  const safeLandmarks: SafeLandmark[] = [
    {
      id: "1",
      name: "V&A Waterfront",
      type: "Shopping Mall",
      lat: -33.9067,
      lng: 18.4219,
      rating: 4.5,
    },
    {
      id: "2",
      name: "Cape Town Central Library",
      type: "Library",
      lat: -33.9249,
      lng: 18.4241,
      rating: 4.8,
    },
    {
      id: "3",
      name: "Canal Walk Shopping Centre",
      type: "Shopping Mall",
      lat: -33.8908,
      lng: 18.5056,
      rating: 4.2,
    },
    {
      id: "4",
      name: "Groote Schuur Hospital",
      type: "Hospital",
      lat: -33.9391,
      lng: 18.4316,
      rating: 4.6,
    },
    {
      id: "5",
      name: "Cape Town Stadium",
      type: "Stadium",
      lat: -33.9034,
      lng: 18.4108,
      rating: 4.3,
    },
  ];

  const trafficAreas: TrafficArea[] = [
    {
      id: "1",
      name: "Cape Town CBD",
      lat: -33.9249,
      lng: 18.4241,
      congestionLevel: "high",
      peakHours: "07:00-09:00, 17:00-19:00",
    },
    {
      id: "2",
      name: "Century City",
      lat: -33.8908,
      lng: 18.5056,
      congestionLevel: "medium",
      peakHours: "08:00-10:00, 16:00-18:00",
    },
    {
      id: "3",
      name: "Claremont",
      lat: -33.9847,
      lng: 18.4647,
      congestionLevel: "high",
      peakHours: "07:30-09:30, 16:30-18:30",
    },
  ];

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const detector = NetworkSignalDetector({
    onLocationUpdate: setUserLocation,
    onSignalUpdate: setSignalStrength,
    onTowerUpdate: setNearestTower,
    onTrafficUpdate: setIsHighTraffic,
    onRecommendationUpdate: setRecommendedLocation,
    cellTowers,
    trafficAreas,
  });

  // Start navigation
  const startNavigation = () => {
    if (recommendedLocation && userLocation) {
      setIsNavigating(true);
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        recommendedLocation.lat,
        recommendedLocation.lng
      );
      const walkingSpeed = 5; // km/h
      const timeInMinutes = Math.round((distance / walkingSpeed) * 60);
      setEta(`${timeInMinutes} min`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            SA Network Provider Portal
          </h1>
          <p className="text-gray-600">
            Direct users to optimal cell towers across South Africa
          </p>
        </div>

        {isHighTraffic && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">High Traffic Area Detected</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Network congestion expected. Redirecting to less congested
                towers.
              </p>
            </CardContent>
          </Card>
        )}

        {/* <CellTowerList /> */}
        <CellTowerList />

        {/* 
        <SignalStrengthIndicator
          signalStrength={signalStrength}
          nearestTower={nearestTower}
          onRefresh={detector.getCurrentLocation}
          isTracking={detector.isTracking}
        /> */}

        <InteractiveMap
          userLocation={userLocation}
          recommendedLocation={recommendedLocation}
          cellTowers={cellTowers}
          safeLandmarks={safeLandmarks}
          signalStrength={signalStrength}
          nearestTower={nearestTower}
          isNavigating={isNavigating}
        />

        <NavigationPanel
          recommendedLocation={recommendedLocation}
          nearestTower={nearestTower}
          signalStrength={signalStrength}
          isNavigating={isNavigating}
          eta={eta}
          onStartNavigation={startNavigation}
        />

        <SafeLandmarksList safeLandmarks={safeLandmarks} />

        {/* <CellTowerList cellTowers={cellTowers} /> */}
      </div>
    </div>
  );
}
