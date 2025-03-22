
import React from "react";
import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowDownCircle, CalendarClock } from "lucide-react";

const statusVariants = cva("font-medium flex items-center text-xs gap-1", {
  variants: {
    variant: {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      received: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      scheduled: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      sheduled: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200", // handle typo in status
      confirmed: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      completed: "bg-green-100 text-green-800 hover:bg-green-200",
      paid: "bg-green-500 text-white hover:bg-green-600",
      rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  },
  defaultVariants: {
    variant: "pending",
  },
});

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant = status.toLowerCase() as
    | "pending"
    | "scheduled"
    | "sheduled"
    | "approved"
    | "paid"
    | "rejected"
    | "received"
    | "confirmed"
    | "completed";

  let statusText: string;
  let StatusIcon: React.ElementType;

  switch (variant) {
    case "pending":
      statusText = "En attente";
      StatusIcon = Clock;
      break;
    case "scheduled":
    case "sheduled":
      statusText = "Programmé";
      StatusIcon = CalendarClock;
      break;
    case "approved":
      statusText = "Approuvé";
      StatusIcon = CheckCircle;
      break;
    case "paid":
      statusText = "Payé";
      StatusIcon = ArrowDownCircle;
      break;
    case "rejected":
      statusText = "Rejeté";
      StatusIcon = XCircle;
      break;
    case "received":
      statusText = "Reçu";
      StatusIcon = AlertCircle;
      break;
    case "confirmed":
      statusText = "Confirmé";
      StatusIcon = CheckCircle;
      break;
    case "completed":
      statusText = "Terminé";
      StatusIcon = CheckCircle;
      break;
    default:
      statusText = status;
      StatusIcon = Clock;
      variant = "pending";
  }

  return (
    <Badge variant="outline" className={statusVariants({ variant, className })}>
      <StatusIcon className="h-3 w-3" />
      <span>{statusText}</span>
    </Badge>
  );
}
