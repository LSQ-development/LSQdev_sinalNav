import { NextRequest } from "next/server"

type Amenity = { id: string; name: string; lat: number; lng: number }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get("lat") || "")
  const lng = parseFloat(searchParams.get("lng") || "")
  const radius = parseInt(searchParams.get("radius") || "1500", 10)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "Missing lat/lng" }, { status: 400 })
  }

  // For demo: generate mock establishments around the point
  const names = [
    "Brew Point Coffee",
    "CoWork Hub",
    "Fiber Lounge",
    "Net Nook Cafe",
    "Signal Space",
    "Bandwidth Bistro",
  ]

  const results: Amenity[] = names.map((name, idx) => {
    const dx = (Math.random() - 0.5) * 0.015
    const dy = (Math.random() - 0.5) * 0.015
    return { id: `${idx}`, name, lat: lat + dx, lng: lng + dy }
  })

  return Response.json({ results })
}


