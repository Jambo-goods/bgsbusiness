
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Add funds to a user's wallet
 */
export const addFundsToUser = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Create a transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        description: 'Dépôt de fonds par l\'administrateur'
      });

    if (transactionError) throw transactionError;

    // Update user wallet balance
    const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });

    if (walletError) throw walletError;

    // Log admin action
    await supabase.from('admin_logs').insert({
      action_type: 'wallet_management',
      description: `Dépôt de ${amount}€ sur le compte utilisateur`,
      target_user_id: userId,
      amount: amount
    });

    toast.success(`${amount}€ ajoutés au compte utilisateur`);
    return true;
  } catch (error) {
    console.error('Error adding funds:', error);
    toast.error('Erreur lors de l\'ajout de fonds');
    return false;
  }
};

/**
 * Withdraw funds from a user's wallet
 */
export const withdrawFundsFromUser = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Check if user has enough balance
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if ((userData.wallet_balance || 0) < amount) {
      toast.error('Solde insuffisant pour effectuer ce retrait');
      return false;
    }

    // Create a transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'withdrawal',
        description: 'Retrait de fonds par l\'administrateur'
      });

    if (transactionError) throw transactionError;

    // Update user wallet balance (negative amount for withdrawal)
    const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: -amount
    });

    if (walletError) throw walletError;

    // Log admin action
    await supabase.from('admin_logs').insert({
      action_type: 'wallet_management',
      description: `Retrait de ${amount}€ du compte utilisateur`,
      target_user_id: userId,
      amount: amount
    });

    toast.success(`${amount}€ retirés du compte utilisateur`);
    return true;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    toast.error('Erreur lors du retrait de fonds');
    return false;
  }
};
