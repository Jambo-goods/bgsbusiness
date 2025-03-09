
import React from "react";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankTransferFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  totalCount: number;
  isLoading: boolean;
}

export default function BankTransferFilters({ 
  statusFilter, 
  setStatusFilter, 
  totalCount,
  isLoading
}: BankTransferFiltersProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Filtrer par statut:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="completed">Confirmés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-gray-500">
        {!isLoading && (
          <>
            {totalCount === 0 ? 
              "Aucun virement bancaire trouvé" : 
              `${totalCount} virements bancaires trouvés`
            }
          </>
        )}
      </div>
    </div>
  );
}
