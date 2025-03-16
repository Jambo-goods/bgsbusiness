
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  );
}
