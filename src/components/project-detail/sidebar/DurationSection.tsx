
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";

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
    <div className="mb-5 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-bgs-blue flex items-center">
          <Clock size={16} className="mr-1.5" />
          Durée d'investissement
        </span>
      </div>
      
      <div className="mb-4">
        <span className="block text-center text-3xl font-bold text-gradient bg-gradient-to-r from-bgs-blue to-bgs-orange">{selectedDuration} mois</span>
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
        
        <div className="flex justify-between mt-4">
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
                px-4 py-2 rounded-lg text-sm font-medium shadow-sm
                ${selectedDuration === duration 
                  ? 'bg-bgs-orange text-white' 
                  : 'bg-white text-bgs-blue/80 hover:bg-bgs-gray-light'}
                transition-all
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
