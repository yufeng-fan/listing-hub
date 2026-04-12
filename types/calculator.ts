export interface MortgageInput {
  homePrice: number; // total price in dollars
  downPaymentPercent: number; // e.g. 20 for 20%
  loanTermYears: number; // e.g. 30
  annualInterestRate: number; // e.g. 6.5 for 6.5%
  annualPropertyTax?: number; // dollars per year
  annualInsurance?: number; // dollars per year
  monthlyHOA?: number; // dollars per month
}

export interface MortgageResult {
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  loanAmount: number;
  downPayment: number;
  totalInterestPaid: number;
  totalCostOverLoan: number;
}

export interface InterestRateData {
  rate30yr: number;
  rate15yr: number;
  rateArm5: number;
  lastUpdated: string;
}
