
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatDate } from '@/utils/formatUtils';
import { formatCurrency } from '@/utils/currencyUtils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ReferralStatusSelect from './ReferralStatusSelect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  commission_rate: number;
  total_commission: number;
  created_at: string;
  referrer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  referred?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface ReferralsTableProps {
  referrals: Referral[];
  isLoading: boolean;
}

const ReferralsTable: React.FC<ReferralsTableProps> = ({ referrals: initialReferrals, isLoading }) => {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [totalCommissions, setTotalCommissions] = useState<{[key: string]: number}>({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Load commissions when referrals data changes
  useEffect(() => {
    setReferrals(initialReferrals);
    if (initialReferrals.length > 0) {
      calculateTotalCommissions(initialReferrals);
    }
  }, [initialReferrals]);
  
  // Function to calculate total commissions from referral_commissions table
  const calculateTotalCommissions = async (refs: Referral[]) => {
    try {
      setIsCalculating(true);
      console.log("Calculating commissions for", refs.length, "referrals");
      
      // For each referral, get the total from referral_commissions table
      const referralIds = refs.map(ref => ref.id);
      
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('referral_id, amount, status')
        .in('referral_id', referralIds);
      
      if (error) {
        console.error("Error fetching commission data:", error);
        toast.error("Erreur lors du calcul des commissions");
        setIsCalculating(false);
        return;
      }
      
      console.log("Commission data fetched:", data);
      
      // Calculate totals by referral_id
      const totals: {[key: string]: number} = {};
      
      // Initialize with zeros
      refs.forEach(ref => {
        totals[ref.id] = 0;
      });
      
      // Sum up commissions with status='completed'
      if (data && data.length > 0) {
        data.forEach((commission: {referral_id: string, amount: number, status: string}) => {
          if (commission.status === 'completed' && totals[commission.referral_id] !== undefined) {
            totals[commission.referral_id] += Number(commission.amount);
          }
        });
        
        console.log("Calculated totals:", totals);
      } else {
        console.log("No commission data found");
      }
      
      setTotalCommissions(totals);
    } catch (error) {
      console.error("Error calculating total commissions:", error);
      toast.error("Erreur lors du calcul des commissions");
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">En attente</Badge>;
      case 'valid':
        return <Badge className="bg-blue-500">Valide</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatName = (user: { first_name?: string, last_name?: string, email?: string } | undefined) => {
    if (!user) return 'Inconnu';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || 'Inconnu';
  };
  
  const handleStatusChange = (id: string, newStatus: string) => {
    setReferrals(current => 
      current.map(referral => 
        referral.id === id ? { ...referral, status: newStatus } : referral
      )
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parrain</TableHead>
              <TableHead>Filleul</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Total perçu</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">Aucun parrainage trouvé dans la base de données</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parrain</TableHead>
            <TableHead>Filleul</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Total perçu</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>{formatName(referral.referrer)}</TableCell>
              <TableCell>{formatName(referral.referred)}</TableCell>
              <TableCell>{getStatusBadge(referral.status)}</TableCell>
              <TableCell>{referral.commission_rate}%</TableCell>
              <TableCell>
                {isCalculating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  formatCurrency(totalCommissions[referral.id] || 0)
                )}
              </TableCell>
              <TableCell>{formatDate(referral.created_at)}</TableCell>
              <TableCell>
                <ReferralStatusSelect 
                  referralId={referral.id}
                  currentStatus={referral.status}
                  onStatusChange={(newStatus) => handleStatusChange(referral.id, newStatus)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReferralsTable;
