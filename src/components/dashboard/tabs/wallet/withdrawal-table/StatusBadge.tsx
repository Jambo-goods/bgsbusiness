
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Complété</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
