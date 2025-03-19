
import React from "react";
import { CheckCircle, Clock, AlertTriangle, ArrowLeftRight, XCircle, CheckCheck, RefreshCcw, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case "pending":
        return {
          label: "En attente",
          className: "bg-yellow-50 text-yellow-600 border-yellow-200",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
      case "received":
      case "reçu":
        return {
          label: "Reçu",
          className: "bg-blue-50 text-blue-600 border-blue-200",
          icon: <Circle className="h-3.5 w-3.5 mr-1" />
        };
      case "confirmed":
        return {
          label: "Confirmé",
          className: "bg-indigo-50 text-indigo-600 border-indigo-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "scheduled":
      case "sheduled": // Handle misspelling in database
        return {
          label: "Programmé",
          className: "bg-purple-50 text-purple-600 border-purple-200",
          icon: <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
        };
      case "approved":
        return {
          label: "Approuvé",
          className: "bg-green-50 text-green-600 border-green-200",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "completed":
      case "processed":
        return {
          label: "Traité",
          className: "bg-green-100 text-green-700 border-green-300",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
        };
      case "paid":
        return {
          label: "Payé",
          className: "bg-green-500 text-white border-green-600",
          icon: <CheckCheck className="h-3.5 w-3.5 mr-1" />
        };
      case "rejected":
        return {
          label: "Rejeté",
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
