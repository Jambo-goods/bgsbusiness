
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  referrer_rewarded: boolean;
  referred_rewarded: boolean;
  created_at: string;
  updated_at: string;
  referred_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const referralService = {
  async getReferralCode(): Promise<ReferralCode | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching referral code:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getReferralCode:", error);
      return null;
    }
  },
  
  async getReferrals(): Promise<Referral[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:referred_id(
            first_name:first_name,
            last_name:last_name,
            email
          )
        `)
        .eq('referrer_id', session.session.user.id);
      
      if (error) {
        console.error("Error fetching referrals:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getReferrals:", error);
      return [];
    }
  },
  
  async generateReferralLink(): Promise<string | null> {
    try {
      const referralCode = await this.getReferralCode();
      
      if (!referralCode) {
        return null;
      }
      
      const baseUrl = window.location.origin;
      return `${baseUrl}/signup?ref=${referralCode.code}`;
    } catch (error) {
      console.error("Error generating referral link:", error);
      return null;
    }
  },
  
  async copyReferralLink(): Promise<boolean> {
    try {
      const link = await this.generateReferralLink();
      
      if (!link) {
        toast.error("Impossible de générer votre lien de parrainage");
        return false;
      }
      
      await navigator.clipboard.writeText(link);
      toast.success("Lien de parrainage copié dans le presse-papier");
      return true;
    } catch (error) {
      console.error("Error copying referral link:", error);
      toast.error("Erreur lors de la copie du lien");
      return false;
    }
  },
  
  async copyReferralCode(): Promise<boolean> {
    try {
      const referralCode = await this.getReferralCode();
      
      if (!referralCode) {
        toast.error("Impossible de récupérer votre code de parrainage");
        return false;
      }
      
      await navigator.clipboard.writeText(referralCode.code);
      toast.success("Code de parrainage copié dans le presse-papier");
      return true;
    } catch (error) {
      console.error("Error copying referral code:", error);
      toast.error("Erreur lors de la copie du code");
      return false;
    }
  },
  
  async getReferralStats(): Promise<{referralsCount: number, totalEarnings: number}> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { referralsCount: 0, totalEarnings: 0 };
      }
      
      // Get referral count
      const { count: referralsCount, error: countError } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', session.session.user.id);
      
      if (countError) {
        console.error("Error counting referrals:", countError);
        throw countError;
      }
      
      // Get total earnings from referral transactions
      const { data: transactions, error: txError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('user_id', session.session.user.id)
        .eq('type', 'referral');
      
      if (txError) {
        console.error("Error fetching referral transactions:", txError);
        throw txError;
      }
      
      const totalEarnings = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      
      return { 
        referralsCount: referralsCount || 0, 
        totalEarnings 
      };
    } catch (error) {
      console.error("Error in getReferralStats:", error);
      return { referralsCount: 0, totalEarnings: 0 };
    }
  }
};
