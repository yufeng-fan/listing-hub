"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  MortgageResult,
  InterestRateData,
} from "@/types/calculator";

interface AffordabilityCalculatorProps {
  /** Pre-fill the home price (e.g. from a listing). In dollars. */
  initialPrice?: number;
}

export default function AffordabilityCalculator({
  initialPrice,
}: AffordabilityCalculatorProps) {
  const [homePrice, setHomePrice] = useState(initialPrice ?? 350000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [annualInterestRate, setAnnualInterestRate] = useState(6.5);
  const [annualPropertyTax, setAnnualPropertyTax] = useState(3600);
  const [annualInsurance, setAnnualInsurance] = useState(1200);
  const [monthlyHOA, setMonthlyHOA] = useState(0);

  // Results
  const [mortgageResult, setMortgageResult] = useState<MortgageResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate data
  const [rates, setRates] = useState<InterestRateData | null>(null);

  useEffect(() => {
    fetch("/api/calculator/rates")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setRates(data);
          setAnnualInterestRate(data.rate30yr);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPrice != null) setHomePrice(initialPrice);
  }, [initialPrice]);

  const calculate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homePrice,
          downPaymentPercent,
          loanTermYears,
          annualInterestRate,
          annualPropertyTax,
          annualInsurance,
          monthlyHOA,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Calculation failed");
        return;
      }

      setMortgageResult(data);
    } catch {
      setError("Failed to connect to calculator service");
    } finally {
      setLoading(false);
    }
  }, [
    homePrice,
    downPaymentPercent,
    loanTermYears,
    annualInterestRate,
    annualPropertyTax,
    annualInsurance,
    monthlyHOA,
  ]);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const applyRate = (rate: number) => {
    setAnnualInterestRate(rate);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-[#1a1a2e] text-white py-3.5 text-sm font-semibold text-center">
        Mortgage Calculator
      </div>

      <div className="p-5 space-y-4">
            {/* Current Rates Banner */}
            {rates && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  Current Market Rates (click to apply)
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "30-yr Fixed", rate: rates.rate30yr },
                    { label: "15-yr Fixed", rate: rates.rate15yr },
                    { label: "5/1 ARM", rate: rates.rateArm5 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => {
                        applyRate(r.rate);
                        if (r.label === "15-yr Fixed") setLoanTermYears(15);
                        else if (r.label === "30-yr Fixed")
                          setLoanTermYears(30);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        annualInterestRate === r.rate
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
                      }`}
                    >
                      {r.label}: {r.rate}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <InputField
              label="Home Price"
              value={homePrice}
              onChange={setHomePrice}
              prefix="$"
              step={5000}
            />
            <InputField
              label="Down Payment"
              value={downPaymentPercent}
              onChange={setDownPaymentPercent}
              suffix="%"
              min={0}
              max={100}
              step={1}
              hint={`$${(homePrice * (downPaymentPercent / 100)).toLocaleString()}`}
            />
            <InputField
              label="Loan Term"
              value={loanTermYears}
              onChange={setLoanTermYears}
              suffix="years"
              min={1}
              max={50}
              step={5}
            />
            <InputField
              label="Interest Rate"
              value={annualInterestRate}
              onChange={setAnnualInterestRate}
              suffix="%"
              min={0}
              max={30}
              step={0.125}
            />
            <InputField
              label="Annual Property Tax"
              value={annualPropertyTax}
              onChange={setAnnualPropertyTax}
              prefix="$"
              step={100}
            />
            <InputField
              label="Annual Insurance"
              value={annualInsurance}
              onChange={setAnnualInsurance}
              prefix="$"
              step={100}
            />
            <InputField
              label="Monthly HOA"
              value={monthlyHOA}
              onChange={setMonthlyHOA}
              prefix="$"
              step={25}
            />

        <button
          onClick={calculate}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#1a1a2e] hover:bg-[#2a2a4e] disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {mortgageResult && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] rounded-xl p-5 text-white text-center">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
                Estimated Monthly Payment
              </p>
              <p className="text-3xl font-bold">
                {fmt(mortgageResult.totalMonthlyPayment)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Principal & Interest"
                value={fmt(mortgageResult.monthlyPrincipalAndInterest)}
              />
              <ResultCard
                label="Property Tax"
                value={fmt(mortgageResult.monthlyPropertyTax)}
              />
              <ResultCard
                label="Insurance"
                value={fmt(mortgageResult.monthlyInsurance)}
              />
              <ResultCard label="HOA" value={fmt(mortgageResult.monthlyHOA)} />
            </div>

            {/* Payment Breakdown Bar */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Payment Breakdown
              </p>
              <div className="flex rounded-lg overflow-hidden h-4">
                <div
                  className="bg-[#1a1a2e]"
                  style={{
                    width: `${(mortgageResult.monthlyPrincipalAndInterest / mortgageResult.totalMonthlyPayment) * 100}%`,
                  }}
                  title="Principal & Interest"
                />
                <div
                  className="bg-blue-400"
                  style={{
                    width: `${(mortgageResult.monthlyPropertyTax / mortgageResult.totalMonthlyPayment) * 100}%`,
                  }}
                  title="Property Tax"
                />
                <div
                  className="bg-amber-400"
                  style={{
                    width: `${(mortgageResult.monthlyInsurance / mortgageResult.totalMonthlyPayment) * 100}%`,
                  }}
                  title="Insurance"
                />
                {mortgageResult.monthlyHOA > 0 && (
                  <div
                    className="bg-green-400"
                    style={{
                      width: `${(mortgageResult.monthlyHOA / mortgageResult.totalMonthlyPayment) * 100}%`,
                    }}
                    title="HOA"
                  />
                )}
              </div>
              <div className="flex gap-3 flex-wrap text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#1a1a2e] inline-block" />
                  P&I
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />
                  Tax
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                  Insurance
                </span>
                {mortgageResult.monthlyHOA > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
                    HOA
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <SummaryRow label="Loan Amount" value={fmt(mortgageResult.loanAmount)} />
              <SummaryRow label="Down Payment" value={fmt(mortgageResult.downPayment)} />
              <SummaryRow
                label="Total Interest Paid"
                value={fmt(mortgageResult.totalInterestPaid)}
              />
              <SummaryRow
                label="Total Cost Over Loan"
                value={fmt(mortgageResult.totalCostOverLoan)}
                bold
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#1a1a2e] focus-within:ring-1 focus-within:ring-[#1a1a2e] transition-colors">
        {prefix && (
          <span className="pl-3 text-sm text-gray-400 select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 py-2.5 px-2 text-sm bg-transparent outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pr-3 text-sm text-gray-400 select-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-gray-900" : "text-gray-800"}>
        {value}
      </span>
    </div>
  );
}
