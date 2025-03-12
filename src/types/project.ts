
export interface Project {
  id: string;
  name: string;
  companyName: string;
  description: string;
  profitability: number;
  duration: string;
  location: string;
  status: "upcoming" | "active" | "completed";
  minInvestment: number;
  maxInvestment?: number;
  image: string;
  category: string;
  price: number;
  yield: number;
  fundingProgress: number;
  featured?: boolean;
  investedAmount?: number;
  possibleDurations?: number[];
  startDate?: string | null;
  endDate?: string | null;
  raised?: number;
  target?: number;
  investmentDate?: string | null;
  firstPaymentDelayMonths?: number; // New field to handle first payment delay
}
