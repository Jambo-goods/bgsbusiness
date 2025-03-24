
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate } from '@/utils/formatUtils';
import { formatCurrency } from '@/utils/currencyUtils';
import StatusBadge from './StatusBadge';
import ReferralStatusSelect from './ReferralStatusSelect';
import { formatName } from './utils/formatUtils';

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

interface ReferralTableRowProps {
  referral: Referral;
  onStatusChange: (referralId: string, newStatus: string) => Promise<any>;
}

const ReferralTableRow: React.FC<ReferralTableRowProps> = ({ 
  referral,
  onStatusChange
}) => {
  return (
    <TableRow key={referral.id}>
      <TableCell>{formatName(referral.referrer)}</TableCell>
      <TableCell>{formatName(referral.referred)}</TableCell>
      <TableCell><StatusBadge status={referral.status} /></TableCell>
      <TableCell>{referral.commission_rate}%</TableCell>
      <TableCell>{formatCurrency(referral.total_commission || 0)}</TableCell>
      <TableCell>{formatDate(referral.created_at)}</TableCell>
      <TableCell>
        <ReferralStatusSelect 
          referralId={referral.id}
          currentStatus={referral.status}
          onStatusChange={(newStatus) => onStatusChange(referral.id, newStatus)}
        />
      </TableCell>
    </TableRow>
  );
};

export default ReferralTableRow;
