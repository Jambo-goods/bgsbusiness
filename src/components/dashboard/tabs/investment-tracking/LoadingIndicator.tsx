
import React from "react";

export default function LoadingIndicator() {
  return (
    <div className="py-8 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange"></div>
    </div>
  );
}
