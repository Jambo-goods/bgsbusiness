
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BankTransferFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  totalCount: number;
  isLoading: boolean;
}

const BankTransferFilters: React.FC<BankTransferFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  totalCount,
  isLoading
}) => {
  const filterOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'completed', label: 'Complétés' },
    { value: 'rejected', label: 'Rejetés' }
  ];

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded-md mb-6"></div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filterOptions.map((option) => (
        <Badge
          key={option.value}
          variant={statusFilter === option.value ? "default" : "outline"}
          className="px-4 py-2 cursor-pointer"
          onClick={() => setStatusFilter(option.value)}
        >
          {option.label}
          {option.value === 'all' && totalCount > 0 && ` (${totalCount})`}
        </Badge>
      ))}
    </div>
  );
};

export default BankTransferFilters;
