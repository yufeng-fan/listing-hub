import AffordabilityCalculator from "@/components/AffordabilityCalculator";

export const metadata = {
  title: "Affordability Calculator | Listing Hub",
  description:
    "Calculate your mortgage payments or find out how much rent you can afford.",
};

export default function CalculatorPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a2e] tracking-tight mb-2">
          Mortgage Calculator
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Estimate your monthly mortgage payment based on home price, down
          payment, interest rate, and other costs.
        </p>
      </div>
      <AffordabilityCalculator />
    </main>
  );
}
