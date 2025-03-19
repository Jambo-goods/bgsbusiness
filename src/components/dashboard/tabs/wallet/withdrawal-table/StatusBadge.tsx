
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
    case 'received':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reçue</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmée</Badge>;
    case 'scheduled':
    case 'sheduled': // handle potential typo in existing data
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Programmée</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complétée</Badge>;
    case 'paid':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Payée</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
