
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
    <div className="mb-4 bg-gradient-to-br from-white to-bgs-gray-light p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-bgs-blue">Durée d'investissement</span>
      </div>
      
      <div className="mb-3">
        <span className="block text-center text-2xl font-bold text-gradient bg-gradient-to-r from-bgs-blue to-bgs-orange">{selectedDuration} mois</span>
      </div>
      
      <div className="px-2 py-3">
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
        
        <div className="flex justify-between mt-3">
          {durations.map((duration) => (
            <div 
              key={duration} 
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedDuration === duration 
                ? 'transform scale-110' 
                : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedDuration(duration)}
            >
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium 
                ${selectedDuration === duration 
                  ? 'bg-bgs-orange text-white shadow-md' 
                  : 'text-bgs-blue/70 hover:text-bgs-blue'}
              `}>
                {duration} mois
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
