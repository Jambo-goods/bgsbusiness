
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from './useUserSession';

export type WalletChange = {
  amount: number;
  percentage: number;
  direction: 'increase' | 'decrease' | 'neutral';
};

export const useWalletData = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletChange, setWalletChange] = useState<WalletChange>({
    amount: 0,
    percentage: 0,
    direction: 'neutral'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUserSession();

  useEffect(() => {
    if (userId) {
      fetchWalletData();
      
      // Set up realtime subscription for wallet changes
      const channel = supabase
        .channel('wallet-balance-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, () => {
          fetchWalletData();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchWalletData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch current wallet balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      const currentBalance = profileData?.wallet_balance || 0;
      setWalletBalance(currentBalance);
      
      // Fetch recent transactions to calculate change
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentTransactions, error: txError } = await supabase
        .from('wallet_transactions')
        .select('amount, type, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (txError) throw txError;
      
      // Calculate wallet change
      calculateWalletChange(recentTransactions || []);
      
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWalletChange = (transactions: any[]) => {
    if (transactions.length === 0) {
      setWalletChange({
        amount: 0,
        percentage: 0,
        direction: 'neutral'
      });
      return;
    }
    
    // Sum deposits and withdrawals
    let netChange = 0;
    
    transactions.forEach(tx => {
      if (tx.type === 'deposit' || tx.type === 'yield') {
        netChange += tx.amount;
      } else if (tx.type === 'withdrawal' || tx.type === 'investment') {
        netChange -= tx.amount;
      }
    });
    
    // Calculate percentage change
    const previousBalance = walletBalance - netChange;
    const percentageChange = previousBalance > 0 
      ? (netChange / previousBalance) * 100 
      : 0;
    
    setWalletChange({
      amount: Math.abs(netChange),
      percentage: Math.abs(percentageChange),
      direction: netChange > 0 ? 'increase' : netChange < 0 ? 'decrease' : 'neutral'
    });
  };

  return {
    walletBalance,
    walletChange,
    isLoading,
    refreshWalletData: fetchWalletData
  };
};
