
import { Investment } from '../types/investment';
import { supabase } from '@/integrations/supabase/client';

export async function fetchInvestmentData(investmentId: string): Promise<Investment | null> {
  try {
    // Fetch the investment details with the project information
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        projects:project_id (
          name,
          description,
          image,
          company_name,
          location,
          yield,
          category,
          funding_progress
        ),
        profiles:user_id (
          first_name,
          last_name
        )
      `)
      .eq('id', investmentId)
      .single();

    if (error) {
      console.error('Error fetching investment data:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Parse dates
    const startDate = new Date(data.date);
    const endDate = data.end_date ? new Date(data.end_date) : null;
    
    // Calculate the remaining duration in months
    let remainingDuration = 0;
    if (endDate) {
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      remainingDuration = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)));
    }

    // Create the investment object with the properly parsed and calculated data
    const investment: Investment = {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      amount: data.amount,
      yield_rate: data.yield_rate,
      status: data.status,
      date: startDate.toISOString(),
      duration: data.duration,
      end_date: endDate ? endDate.toISOString() : '',
      remainingDuration,
      projects: {
        ...data.projects,
        category: data.projects?.category || '',
        funding_progress: data.projects?.funding_progress || 0
      },
      // Access the profiles data if it exists
      user_first_name: data.profiles?.first_name || '',
      user_last_name: data.profiles?.last_name || ''
    };

    return investment;
  } catch (error) {
    console.error('Error in fetchInvestmentData:', error);
    return null;
  }
}
