import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q) {
    return Response.json({ error: "Missing q" }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Insite/1.0 (insite.app)"
      },
      cache: "no-store",
    })
    if (!res.ok) {
      return Response.json({ error: "Geocoding failed" }, { status: 502 })
    }
    const json = await res.json()
    if (!Array.isArray(json) || json.length === 0) {
      return Response.json({ error: "No results" }, { status: 404 })
    }
    const first = json[0]
    const lat = parseFloat(first.lat)
    const lng = parseFloat(first.lon)
    return Response.json({ lat, lng })
  } catch (e) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}


