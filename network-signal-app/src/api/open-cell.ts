import { NextApiRequest, NextApiResponse } from "next";
import { OPENCELLID_API_KEY, API_CONFIG } from "@/utils/constants";
import {
  OpenCelliDResponse,
  CellTower,
  CellTowerApiResponse,
  ApiError,
  ApiQuery,
} from "../../types/opencellid";
import { calculateDistance } from "@/utils/helper";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    lat,
    lon,
    radius = API_CONFIG.DEFAULT_RADIUS.toString(),
    limit = API_CONFIG.DEFAULT_LIMIT.toString(),
  }: ApiQuery = req.query;

  // Validate required parameters
  if (!lat || !lon) {
    return res.status(400).json({
      error: "Latitude and longitude are required",
    });
  }

  // Validate numeric inputs
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const radiusNum = parseFloat(radius);
  const limitNum = parseInt(limit, 10);

  if (isNaN(latNum) || isNaN(lonNum) || isNaN(radiusNum) || isNaN(limitNum)) {
    return res.status(400).json({
      error: "Invalid numeric parameters",
    });
  }

  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return res.status(400).json({
      error: "Invalid latitude or longitude values",
    });
  }

  if (radiusNum > API_CONFIG.MAX_RADIUS) {
    return res.status(400).json({
      error: `Radius cannot exceed ${API_CONFIG.MAX_RADIUS} km`,
    });
  }

  try {
    const apiKey = OPENCELLID_API_KEY;

    if (!apiKey) {
      throw new Error("OpenCelliD API key not configured");
    }

    const latDelta = radiusNum / 111; // 1 degree ≈ 111 km
    const lonDelta = radiusNum / (111 * Math.cos((latNum * Math.PI) / 180));

    // Build query parameters
    const params = new URLSearchParams({
      key: apiKey,
      BBOX: `${lonNum - lonDelta},${latNum - latDelta},${lonNum + lonDelta},${
        latNum + latDelta
      }`,
      format: "json",
      limit: limitNum.toString(),
    });

    const response = await fetch(
      `${API_CONFIG.OPENCELLID_BASE_URL}?${params}`,
      {
        headers: {
          "User-Agent": API_CONFIG.USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `OpenCelliD API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenCelliDResponse = await response.json();

    const towers: CellTower[] =
      data.cells
        ?.map((cell) => ({
          id: cell.cell,
          mcc: cell.mcc,
          mnc: cell.mnc,
          lac: cell.lac,
          cid: cell.cid,
          lat: parseFloat(cell.lat),
          lon: parseFloat(cell.lon),
          range: cell.range,
          radio: cell.radio,
          samples: cell.samples,
          changeable: cell.changeable,
          created: cell.created,
          updated: cell.updated,
          // Calculate distance from query point
          distance: calculateDistance(
            latNum,
            lonNum,
            parseFloat(cell.lat),
            parseFloat(cell.lon)
          ),
        }))
        .filter((tower) => tower.distance <= radiusNum) || [];

         res.status(200).json({
      success: true,
      count: towers.length,
      towers: towers.sort((a, b) => a.distance - b.distance) // Sort by distance
    });
  } catch (error) {
    console.error("Error fetching cell towers:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to fetch cell towers",
      message: errorMessage,
    });
  }
};
