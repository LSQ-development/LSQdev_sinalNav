// components/SearchBar.tsx
"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string, lat: number, lng: number) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const parseCoordinates = (
    input: string
  ): { lat: number; lng: number } | null => {
    // Remove extra whitespace and normalize input
    const cleanInput = input.trim();

    // Try different coordinate formats
    const patterns = [
      // Format: "40.7128, -74.0060" or "40.7128,-74.0060"
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
      // Format: "40.7128 -74.0060" (space separated)
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,
      // Format: "lat: 40.7128, lng: -74.0060" or similar
      /(?:lat|latitude):\s*(-?\d+\.?\d*)[,\s]+(?:lng|lon|longitude):\s*(-?\d+\.?\d*)/i,
      // Format: "40.7128° N, 74.0060° W" (with degrees - basic version)
      /^(-?\d+\.?\d*)°?\s*[NS]?\s*,?\s*(-?\d+\.?\d*)°?\s*[EW]?$/i,
    ];

    for (const pattern of patterns) {
      const match = cleanInput.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // Validate coordinate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (query.trim() === "") {
      setError("Please enter coordinates");
      return;
    }

    const coordinates = parseCoordinates(query);

    if (coordinates) {
      onSearch(query, coordinates.lat, coordinates.lng);
      setQuery(""); // Clear the input after successful search
    } else {
      setError(
        "Invalid coordinate format. Try: '40.7128, -74.0060' or '40.7128 -74.0060'"
      );
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-3/4 sm:w-1/2">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(""); // Clear error when user starts typing
          }}
          placeholder="Enter coordinates (e.g., 40.7128, -74.0060)"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {error && (
          <div className="px-4 py-2 text-red-600 text-sm bg-red-50 rounded-b-lg">
            {error}
          </div>
        )}
      </form>

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 text-center bg-white/90 rounded px-2 py-1"></div>
    </div>
  );
}
