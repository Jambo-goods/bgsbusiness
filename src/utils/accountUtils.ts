
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

// Calculate energy consumption for heater (demo purposes)
export const calculateHeaterConsumption = (powerLevel: number, hours: number): number => {
  // Assuming a 2000W heater at 100% power
  const consumption = (2000 * (powerLevel / 100) * hours) / 1000; // in kWh
  return Math.round(consumption * 100) / 100;
};

// Calculate cost of energy (demo purposes)
export const calculateEnergyCost = (consumption: number): number => {
  // Assuming 0.20€ per kWh
  return Math.round(consumption * 0.20 * 100) / 100;
};
