
import React from "react";
import { Filter, Download } from "lucide-react";

interface FilterControlsProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export default function FilterControls({ filterStatus, setFilterStatus }: FilterControlsProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-bgs-orange"
      >
        <option value="all">Tous les statuts</option>
        <option value="paid">Payés</option>
        <option value="pending">En attente</option>
        <option value="scheduled">Programmés</option>
      </select>
      
      <button className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium hover:bg-gray-50">
        <Filter className="h-3.5 w-3.5" />
      </button>
      
      <button className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium hover:bg-gray-50">
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
