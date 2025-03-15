
import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";

export default function ViewCounter() {
  // Instead of generating random view counts, we'll just use a placeholder
  return (
    <div className="flex items-center justify-center text-xs text-bgs-blue/60 bg-white rounded-lg py-2 shadow-sm border border-gray-100">
      <Eye className="h-3 w-3 mr-1" />
      <span>Vues: --</span>
    </div>
  );
}
