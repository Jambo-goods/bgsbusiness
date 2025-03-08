
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';

type DateRange = {
  start: Date | null;
  end: Date | null;
};

type TransactionFiltersProps = {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  transactionType: string;
  setTransactionType: React.Dispatch<React.SetStateAction<string>>;
};

export function TransactionFilters({ 
  dateRange, 
  setDateRange, 
  transactionType, 
  setTransactionType 
}: TransactionFiltersProps) {
  
  const formatDateString = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy');
  };
  
  const clearFilters = () => {
    setDateRange({ start: null, end: null });
    setTransactionType('all');
  };
  
  const hasActiveFilters = dateRange.start || dateRange.end || transactionType !== 'all';
  
  return (
    <div className="pb-4 mb-4 border-b flex flex-wrap gap-2 items-center">
      <div className="flex items-center text-sm">
        <Filter className="w-4 h-4 mr-2" />
        Filtres:
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 text-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            {dateRange.start && dateRange.end
              ? `${formatDateString(dateRange.start)} - ${formatDateString(dateRange.end)}`
              : "Période"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={{ 
              from: dateRange.start || undefined, 
              to: dateRange.end || undefined 
            }}
            onSelect={(range) => setDateRange({ 
              start: range?.from || null, 
              end: range?.to || null 
            })}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
      
      <select
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        className="px-3 py-1 text-sm border rounded-md"
      >
        <option value="all">Tous types</option>
        <option value="deposit">Dépôts</option>
        <option value="withdrawal">Retraits</option>
      </select>
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters} 
          className="text-sm text-gray-500"
        >
          Effacer les filtres
        </Button>
      )}
    </div>
  );
}
