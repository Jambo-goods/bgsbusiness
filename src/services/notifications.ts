
// Empty notification service stub file to maintain compatibility
// This is a placeholder for removed notification functionality

export const notificationService = {
  // Empty methods to maintain compatibility
  investmentConfirmed: (amount: number, projectName: string, projectId: string) => {
    console.log("Notification service called: investmentConfirmed", { amount, projectName, projectId });
    return Promise.resolve();
  },
  
  newInvestmentOpportunity: (projectName: string, projectId: string) => {
    console.log("Notification service called: newInvestmentOpportunity", { projectName, projectId });
    return Promise.resolve();
  },
  
  depositSuccess: (amount: number) => {
    console.log("Notification service called: depositSuccess", { amount });
    return Promise.resolve();
  }
};
