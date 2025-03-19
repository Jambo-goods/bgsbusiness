
import React from "react";
import { CheckCircle, Clock, AlertTriangle, ArrowLeftRight, XCircle, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          className: "bg-yellow-50 text-yellow-600 border-yellow-200",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
      case "received":
        return {
          label: "Reçue",
          className: "bg-blue-50 text-blue-600 border-blue-200",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
      case "confirmed":
        return {
          label: "Confirmée",
          className: "bg-indigo-50 text-indigo-600 border-indigo-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "scheduled":
      case "sheduled": // Handle misspelling in database
        return {
          label: "Programmée",
          className: "bg-purple-50 text-purple-600 border-purple-200",
          icon: <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
        };
      case "approved":
        return {
          label: "Approuvée",
          className: "bg-green-50 text-green-600 border-green-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "completed":
        return {
          label: "Complétée",
          className: "bg-green-100 text-green-700 border-green-300",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "paid":
        return {
          label: "Payée",
          className: "bg-green-500 text-white border-green-600",
          icon: <CheckCheck className="h-3.5 w-3.5 mr-1" />
        };
      case "rejected":
        return {
          label: "Rejetée",
          className: "bg-red-50 text-red-600 border-red-200",
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />
        };
      default:
        return {
          label: status,
          className: "bg-gray-50 text-gray-600 border-gray-200",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        };
    }
  };
  
  const { label, className, icon } = getStatusConfig(status);
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      className
    )}>
      {icon}
      {label}
    </span>
  );
}
