
import React from "react";

export default function LoadingView() {
  return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
    </div>
  );
}
