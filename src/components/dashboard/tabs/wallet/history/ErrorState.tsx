
import React from "react";

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <p className="text-center py-6 text-red-500">{message}</p>
  );
}
