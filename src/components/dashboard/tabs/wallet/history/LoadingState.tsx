
import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex justify-center py-6">
      <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
    </div>
  );
}
