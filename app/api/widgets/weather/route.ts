import { NextResponse } from "next/server";

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 5 * 60 * 1000;

function cached(key: string) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  return null;
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const city = (params.get("city") ?? "").trim();
  const units = params.get("units") === "fahrenheit" ? "fahrenheit" : "celsius";

  if (!city) {
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  }

  const key = `${city.toLowerCase()}|${units}`;
  const hit = cached(key);
  if (hit) return NextResponse.json(hit);

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geo = (await geoRes.json()) as {
      results?: Array<{
        name: string;
        country?: string;
        latitude: number;
        longitude: number;
      }>;
    };
    const place = geo.results?.[0];
    if (!place) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const fcRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=${units}&timezone=auto&forecast_days=1`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!fcRes.ok) throw new Error("Forecast failed");
    const fc = (await fcRes.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
      };
    };

    const data = {
      city: place.name,
      country: place.country ?? "",
      temp: Math.round(fc.current?.temperature_2m ?? 0),
      code: fc.current?.weather_code ?? 0,
      humidity: fc.current?.relative_humidity_2m ?? null,
      wind: Math.round(fc.current?.wind_speed_10m ?? 0),
      high: Math.round(fc.daily?.temperature_2m_max?.[0] ?? 0),
      low: Math.round(fc.daily?.temperature_2m_min?.[0] ?? 0),
      units,
    };

    cache.set(key, { at: Date.now(), data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather widget error:", error);
    return NextResponse.json(
      { error: "Weather is unavailable right now" },
      { status: 502 }
    );
  }
}
