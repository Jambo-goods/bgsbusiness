
import React from "react";

interface DurationSectionProps {
  durations: number[];
  selectedDuration: number;
  onChange: (duration: number) => void;
}

export default function DurationSection({
  durations,
  selectedDuration,
  onChange
}: DurationSectionProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-bgs-blue mb-2">Durée</h4>
      <div className="grid grid-cols-3 gap-2">
        {durations.map((duration) => (
          <button
            key={duration}
            type="button"
            className={`py-2 px-3 text-sm rounded-md transition-colors ${
              selectedDuration === duration
                ? "bg-bgs-blue text-white"
                : "bg-white border border-bgs-gray-light text-bgs-blue hover:bg-bgs-gray-light"
            }`}
            onClick={() => onChange(duration)}
          >
            {duration} mois
          </button>
        ))}
      </div>
    </div>
  );
}
