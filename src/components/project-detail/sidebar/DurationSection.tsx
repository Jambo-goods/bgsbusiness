
import React from "react";
import { Slider } from "@/components/ui/slider";

interface DurationSectionProps {
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  durations: number[];
}

export default function DurationSection({
  selectedDuration,
  setSelectedDuration,
  durations
}: DurationSectionProps) {
  const handleDurationChange = (values: number[]) => {
    setSelectedDuration(values[0]);
  };

  return (
    <div className="mb-4 bg-bgs-gray-light p-3 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-bgs-blue">Durée d'investissement</span>
      </div>
      
      <div className="mb-2">
        <span className="block text-center text-xl font-bold text-bgs-blue">{selectedDuration} mois</span>
      </div>
      
      <div className="px-2 py-4">
        <Slider
          defaultValue={[selectedDuration]}
          max={Math.max(...durations)}
          min={Math.min(...durations)}
          step={durations.length > 1 ? undefined : 1}
          value={[selectedDuration]}
          onValueChange={handleDurationChange}
          className="my-4"
          minStepsBetweenThumbs={1}
        />
        
        <div className="flex justify-between mt-2">
          {durations.map((duration) => (
            <span 
              key={duration} 
              className={`text-sm ${selectedDuration === duration ? 'text-bgs-orange font-medium' : 'text-bgs-blue/70'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedDuration(duration)}
            >
              {duration} mois
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
