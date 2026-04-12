import { NextRequest, NextResponse } from "next/server";
import type {
  MortgageInput,
  MortgageResult,
} from "@/types/calculator";

function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPayment = input.homePrice * (input.downPaymentPercent / 100);
  const loanAmount = input.homePrice - downPayment;
  const monthlyRate = input.annualInterestRate / 100 / 12;
  const numPayments = input.loanTermYears * 12;

  let monthlyPrincipalAndInterest: number;

  if (monthlyRate === 0) {
    monthlyPrincipalAndInterest = loanAmount / numPayments;
  } else {
    // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, numPayments);
    monthlyPrincipalAndInterest =
      (loanAmount * (monthlyRate * factor)) / (factor - 1);
  }

  const monthlyPropertyTax = (input.annualPropertyTax ?? 0) / 12;
  const monthlyInsurance = (input.annualInsurance ?? 0) / 12;
  const monthlyHOA = input.monthlyHOA ?? 0;

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyHOA;

  const totalCostOverLoan = monthlyPrincipalAndInterest * numPayments;
  const totalInterestPaid = totalCostOverLoan - loanAmount;

  return {
    monthlyPrincipalAndInterest: round2(monthlyPrincipalAndInterest),
    monthlyPropertyTax: round2(monthlyPropertyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyHOA: round2(monthlyHOA),
    totalMonthlyPayment: round2(totalMonthlyPayment),
    loanAmount: round2(loanAmount),
    downPayment: round2(downPayment),
    totalInterestPaid: round2(totalInterestPaid),
    totalCostOverLoan: round2(totalCostOverLoan),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Validation helpers
function validatePositive(val: unknown, name: string): number {
  const n = Number(val);
  if (isNaN(n) || n < 0) throw new Error(`${name} must be a non-negative number`);
  return n;
}

function validateRange(val: unknown, name: string, min: number, max: number): number {
  const n = Number(val);
  if (isNaN(n) || n < min || n > max)
    throw new Error(`${name} must be between ${min} and ${max}`);
  return n;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input: MortgageInput = {
      homePrice: validatePositive(body.homePrice, "homePrice"),
      downPaymentPercent: validateRange(body.downPaymentPercent, "downPaymentPercent", 0, 100),
      loanTermYears: validateRange(body.loanTermYears, "loanTermYears", 1, 50),
      annualInterestRate: validateRange(body.annualInterestRate, "annualInterestRate", 0, 30),
      annualPropertyTax: body.annualPropertyTax != null ? validatePositive(body.annualPropertyTax, "annualPropertyTax") : undefined,
      annualInsurance: body.annualInsurance != null ? validatePositive(body.annualInsurance, "annualInsurance") : undefined,
      monthlyHOA: body.monthlyHOA != null ? validatePositive(body.monthlyHOA, "monthlyHOA") : undefined,
    };
    const result = calculateMortgage(input);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
