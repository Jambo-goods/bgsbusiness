// Calculate total invested amount from user investments
export const calculateTotalInvested = (userInvestments: any[]): number => {
  return userInvestments.reduce((total, investment) => total + 2500, 0); // Assuming each investment is 2500€
};

// Calculate available balance (in a real app, this would come from the backend)
export const calculateAvailableBalance = (): number => {
  return 3000; // Hardcoded for demo purposes
};

// Calculate monthly return based on investments
export const calculateMonthlyReturn = (userInvestments: any[]): number => {
  return userInvestments.reduce((total, investment) => {
    const monthlyYield = (2500 * investment.yield) / 100 / 12;
    return total + monthlyYield;
  }, 0);
};

// Calculate annual return based on investments
export const calculateAnnualReturn = (userInvestments: any[]): number => {
  return userInvestments.reduce((total, investment) => {
    const annualYield = (2500 * investment.yield) / 100;
    return total + annualYield;
  }, 0);
};

// Calculate heater consumption based on power level and state
export const calculateHeaterConsumption = (powerLevel: number, isHeaterOn: boolean): number => {
  if (!isHeaterOn) return 0;
  // Base consumption is between 0.5 and 2.5 kWh per day based on power level
  return (powerLevel / 100) * 2 + 0.5;
};

// Calculate energy cost based on consumption (kWh) and price per kWh
export const calculateEnergyCost = (consumption: number): number => {
  const pricePerKwh = 0.174; // Price in euros per kWh
  return consumption * pricePerKwh;
};
