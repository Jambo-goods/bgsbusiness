
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useReferrals } from '@/hooks/admin/useReferrals';
import ReferralTableRow from './ReferralTableRow';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

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

const ReferralsTable: React.FC<ReferralsTableProps> = ({ referrals, isLoading }) => {
  const { updateReferralStatus } = useReferrals();
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (referrals.length === 0) {
    return <EmptyState />;
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
            <ReferralTableRow 
              key={referral.id} 
              referral={referral} 
              onStatusChange={updateReferralStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReferralsTable;
