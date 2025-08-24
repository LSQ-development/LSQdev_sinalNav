/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import towers from "@/app/data/cell_towers.json";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 }
    );
  }

  // Compute distance for each tower
  const towersWithDistance = towers.map((t: any) => ({
    ...t,
    distance: haversine(lat, lon, t.Latitude, t.Longitude),
  }));

  // Sort and return closest 5
  const sorted = towersWithDistance.sort(
    (a: any, b: any) => a.distance - b.distance
  );

  return NextResponse.json(sorted.slice(0, 5));
}
