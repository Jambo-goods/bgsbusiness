
import React from "react";
import { Eye } from "lucide-react";

export default function ViewCounter() {
  return (
    <div className="flex items-center justify-center text-xs text-bgs-blue/60 bg-white rounded-lg py-2 shadow-sm border border-gray-100">
      <Eye className="h-3 w-3 mr-1" />
      <span>0 personnes ont consulté ce projet</span>
    </div>
  );
}
