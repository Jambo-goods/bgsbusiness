
// Processing logic for investor yields
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { calculateYieldAmount } from "./utils.ts";
import { 
  checkExistingTransaction, 
  updateWalletBalance, 
  createTransaction, 
  createNotification 
} from "./database.ts";

// Process yields for all investors in a project
export async function processInvestorYields(
  supabase: SupabaseClient,
  investments: any[],
  project: any,
  payment: any,
  paymentPercentage: number,
  forceRefresh: boolean
): Promise<number> {
  let processedCount = 0;
  
  if (!investments || investments.length === 0) {
    console.log(`No investments found for project ${payment.project_id}, skipping processing`);
    return 0;
  }
  
  if (!project) {
    console.log(`Project data not available for ${payment.project_id}, skipping processing`);
    return 0;
  }
  
  // Log how many investments we're processing and their status
  console.log(`Processing ${investments.length} investments for project ${project.name} (ID: ${payment.project_id})`);
  
  // Check if all investments have 'active' status
  const activeInvestments = investments.filter(inv => inv.status === 'active');
  console.log(`${activeInvestments.length} out of ${investments.length} investments have 'active' status`);
  
  // Log all investment statuses for debugging
  const statuses = {};
  investments.forEach(inv => {
    statuses[inv.status] = (statuses[inv.status] || 0) + 1;
  });
  console.log('Investment statuses breakdown:', statuses);
  
  // Only process active investments
  for (const investment of activeInvestments) {
    const userId = investment.user_id;
    if (!userId) {
      console.log(`Investment ${investment.id} has no user_id, skipping`);
      continue;
    }
    
    try {
      // Debug information for this specific investment
      console.log(`Processing investment ${investment.id} for user ${userId}, amount: ${investment.amount}, status: ${investment.status}`);
      
      // Calculate yield amount for this investor using project yield rate
      // Convert to monthly yield rate (divide by 12 months)
      const yearlyYieldRate = (project.yield || 0);
      const monthlyYieldRate = yearlyYieldRate / 12;
      const yieldAmount = Math.floor((investment.amount * monthlyYieldRate / 100) * paymentPercentage / 100);
      
      console.log(`Project ${project.name} yield rate: ${yearlyYieldRate}% yearly, ${monthlyYieldRate.toFixed(2)}% monthly`);
      console.log(`Yield calculation for user ${userId}: ${investment.amount} * ${monthlyYieldRate.toFixed(2)}% * ${paymentPercentage}% = ${yieldAmount}`);
      
      if (yieldAmount <= 0) {
        console.log(`Zero or negative yield for user ${userId}, investment ${investment.id}: ${yieldAmount}, skipping`);
        continue;
      }
      
      // Check if we've already processed this yield transaction
      const { exists, error: checkError } = await checkExistingTransaction(
        supabase, 
        userId, 
        payment.id, 
        payment.project_id
      );
      
      if (checkError) {
        console.error(`Error checking existing transaction for user ${userId}:`, checkError);
        continue;
      }
      
      if (exists && !forceRefresh) {
        console.log(`Yield transaction already exists for user ${userId}, payment ${payment.id}`);
        continue;
      } else if (exists && forceRefresh) {
        console.log(`Force refresh enabled, processing again anyway for user ${userId}`);
      }
      
      // Process the yield
      const processResult = await processYield(
        supabase,
        userId,
        yieldAmount,
        project.name,
        paymentPercentage,
        payment.id,
        payment.project_id
      );
      
      if (processResult.success) {
        processedCount++;
        console.log(`Successfully processed yield for user ${userId}, amount: ${yieldAmount}`);
      } else {
        console.error(`Failed to process yield for user ${userId}`);
      }
    } catch (err) {
      console.error(`Error processing yield for investment ${investment.id}:`, err);
      continue; // Skip this investment but continue with others
    }
  }
  
  console.log(`Completed processing with ${processedCount} successful transactions`);
  return processedCount;
}

// Process an individual yield
async function processYield(
  supabase: SupabaseClient,
  userId: string,
  yieldAmount: number,
  projectName: string,
  percentage: number,
  paymentId: string,
  projectId: string
): Promise<{ success: boolean }> {
  try {
    // Update user's wallet balance
    const { success: balanceUpdated, error: balanceError } = await updateWalletBalance(
      supabase, 
      userId, 
      yieldAmount
    );
    
    if (!balanceUpdated) {
      console.error(`Error updating wallet balance for user ${userId}:`, balanceError);
      return { success: false };
    }
    
    // Create a wallet transaction record
    const { transaction, error: transactionError } = await createTransaction(
      supabase,
      userId,
      yieldAmount,
      projectName,
      percentage,
      paymentId,
      projectId
    );
    
    if (transactionError) {
      console.error(`Error creating transaction record for user ${userId}:`, transactionError);
      return { success: false };
    }
    
    // Create notification for the user
    const { notification, error: notifError } = await createNotification(
      supabase,
      userId,
      yieldAmount,
      projectName,
      paymentId,
      projectId
    );
    
    if (notifError) {
      console.error(`Error creating notification for user ${userId}:`, notifError);
      // Continue anyway as this is not critical
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Error processing yield for user ${userId}:`, err);
    return { success: false };
  }
}
