import { NextResponse } from "next/server";
import type { InterestRateData } from "@/types/calculator";

// Cache rates for 1 hour to avoid excessive API calls
let cachedRates: InterestRateData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function fetchRatesFromAPI(): Promise<InterestRateData> {
  const apiKey = process.env.FRED_API_KEY;

  if (apiKey) {
    // Use FRED (Federal Reserve Economic Data) API for real mortgage rates
    // Series: MORTGAGE30US (30-Year Fixed), MORTGAGE15US (15-Year Fixed), MORTGAGE5US (5/1-Year ARM)
    const seriesIds = ["MORTGAGE30US", "MORTGAGE15US", "MORTGAGE5US"];
    const results: number[] = [];

    for (const seriesId of seriesIds) {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${encodeURIComponent(seriesId)}&api_key=${encodeURIComponent(apiKey)}&file_type=json&sort_order=desc&limit=1`;
      const res = await fetch(url, { next: { revalidate: 3600 } });

      if (!res.ok) {
        throw new Error(`FRED API error for ${seriesId}: ${res.status}`);
      }

      const data = await res.json();
      const value = parseFloat(data.observations?.[0]?.value);
      results.push(isNaN(value) ? 0 : value);
    }

    return {
      rate30yr: results[0],
      rate15yr: results[1],
      rateArm5: results[2],
      lastUpdated: new Date().toISOString(),
    };
  }

  // Fallback: reasonable default rates when no API key is configured
  return {
    rate30yr: 6.65,
    rate15yr: 5.89,
    rateArm5: 6.12,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();
    if (cachedRates && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedRates);
    }

    const rates = await fetchRatesFromAPI();
    cachedRates = rates;
    cacheTimestamp = now;

    return NextResponse.json(rates);
  } catch (err: unknown) {
    // Return cached data if available, even if stale
    if (cachedRates) {
      return NextResponse.json(cachedRates);
    }

    const message = err instanceof Error ? err.message : "Failed to fetch rates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
