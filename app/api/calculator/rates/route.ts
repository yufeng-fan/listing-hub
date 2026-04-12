import { NextResponse } from "next/server";
import type { InterestRateData } from "@/types/calculator";

// Cache rates for 1 hour to avoid excessive API calls
let cachedRates: InterestRateData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function fetchRatesFromAPI(): Promise<InterestRateData> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (apiKey) {
    // Use RapidAPI "Realty in US" (by APIDojo) – mortgage/v2/check-rates endpoint
    const url = `https://realty-in-us.p.rapidapi.com/mortgage/v2/check-rates?postal_code=90004`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "realty-in-us.p.rapidapi.com",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`RapidAPI mortgage rates error: ${res.status}`);
    }

    const data = await res.json();

    // Parse rates from the response – the API returns rate objects under data.loan_analysis.market
    const market = data?.data?.loan_analysis?.market;
    const ratesArray: Array<{ loan_type?: { term?: number; loan_id?: string }; rate?: number }> =
      market?.mortgage_data?.average_rates ?? [];

    let rate30yr = 0;
    let rate15yr = 0;
    let rateArm5 = 0;

    for (const entry of ratesArray) {
      const loanId = entry.loan_type?.loan_id ?? "";
      const term = entry.loan_type?.term ?? 0;
      const rate = entry.rate ?? 0;

      if (loanId === "thirty_year_fix" || term === 30) {
        rate30yr = rate;
      } else if (loanId === "fifteen_year_fix" || term === 15) {
        rate15yr = rate;
      } else if (loanId === "five_one_arm" || loanId.includes("arm")) {
        rateArm5 = rate;
      }
    }

    return {
      rate30yr,
      rate15yr,
      rateArm5,
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
