// Affordability Engine adhering to the Lifestyle Home Finder Specification

export interface CreditScoreRateTier {
  minScore: number;
  maxScore: number;
  annualRate: number; // e.g. 0.0675 for 6.75%
  label: string;
}

export const CREDIT_SCORE_TIERS: CreditScoreRateTier[] = [
  { minScore: 780, maxScore: 850, annualRate: 0.0625, label: 'Excellent (6.25%)' },
  { minScore: 740, maxScore: 779, annualRate: 0.0650, label: 'Very Good (6.50%)' },
  { minScore: 720, maxScore: 739, annualRate: 0.0675, label: 'Good (6.75%)' },
  { minScore: 680, maxScore: 719, annualRate: 0.0710, label: 'Fair (7.10%)' },
  { minScore: 640, maxScore: 679, annualRate: 0.0760, label: 'Sub-prime (7.60%)' },
  { minScore: 580, maxScore: 639, annualRate: 0.0825, label: 'Challenged (8.25%)' },
  { minScore: 300, maxScore: 579, annualRate: 0.0890, label: 'High Risk (8.90%)' },
];

export function getInterestRateForCreditScore(score: number): number {
  const tier = CREDIT_SCORE_TIERS.find(t => score >= t.minScore && score <= t.maxScore);
  return tier ? tier.annualRate : 0.0725;
}

export interface MonthlyCostBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  totalMonthly: number;
  withinBudget: boolean;
}

/**
 * Calculates monthly mortgage and full carrying costs
 * P = Home Price
 * D = Down Payment
 * creditScore = sets interest rate
 * annualTaxRate = default 0.02 (Texas ~ 2%)
 * annualInsuranceRate = default 0.005 (0.5%)
 */
export function calculateMonthlyCost(
  homePrice: number,
  downPayment: number,
  creditScore: number = 720,
  annualTaxRate: number = 0.02,
  annualInsuranceRate: number = 0.005
): MonthlyCostBreakdown {
  const loanAmount = Math.max(0, homePrice - downPayment);
  const annualRate = getInterestRateForCreditScore(creditScore);
  const monthlyRate = annualRate / 12;
  const numPayments = 360; // 30-year fixed

  // Principal & Interest formula
  let pi = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    pi = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
         (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Property Tax (annual rate / 12)
  const propertyTax = (homePrice * annualTaxRate) / 12;

  // Home insurance (0.5% default / 12)
  const insurance = (homePrice * annualInsuranceRate) / 12;

  // PMI: Applies when down payment < 20% of home price. Default 0.5% of loan per year
  const isPmiRequired = downPayment < 0.20 * homePrice && loanAmount > 0;
  const pmi = isPmiRequired ? (loanAmount * 0.005) / 12 : 0;

  const totalMonthly = Math.round(pi + propertyTax + insurance + pmi);

  return {
    principalAndInterest: Math.round(pi),
    propertyTax: Math.round(propertyTax),
    insurance: Math.round(insurance),
    pmi: Math.round(pmi),
    totalMonthly,
    withinBudget: true,
  };
}

/**
 * Solves for the maximum home purchase price ceiling given budget parameters:
 * Monthly Budget B is smaller of buyer's max monthly mortgage and 28% gross monthly income
 */
export function calculateMaxHomePrice(
  downPayment: number,
  grossMonthlyIncome: number,
  maxMonthlyMortgageInput: number,
  creditScore: number = 720,
  annualTaxRate: number = 0.02,
  annualInsuranceRate: number = 0.005
): { maxPrice: number; monthlyBudgetCap: number; isIncomeConstrained: boolean } {
  // Spec: Monthly budget B is smaller of buyer's max monthly mortgage and 28% of monthly income
  const incomeCeiling28 = grossMonthlyIncome * 0.28;
  const monthlyBudgetCap = Math.min(maxMonthlyMortgageInput, incomeCeiling28);
  const isIncomeConstrained = maxMonthlyMortgageInput > incomeCeiling28;

  // Binary search for max price between down payment and $5,000,000
  let low = downPayment;
  let high = 5000000;
  let maxPrice = downPayment;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const { totalMonthly } = calculateMonthlyCost(mid, downPayment, creditScore, annualTaxRate, annualInsuranceRate);

    if (totalMonthly <= monthlyBudgetCap) {
      maxPrice = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  // Round to nearest thousand
  return {
    maxPrice: Math.floor(maxPrice / 1000) * 1000,
    monthlyBudgetCap: Math.round(monthlyBudgetCap),
    isIncomeConstrained,
  };
}
