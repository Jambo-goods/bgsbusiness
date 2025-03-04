
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
  image: string;
  category: string;
  price: number;
  yield: number;
  fundingProgress: number;
  featured?: boolean;
  possibleDurations?: number[];
  startDate?: string;
  endDate?: string;
}
