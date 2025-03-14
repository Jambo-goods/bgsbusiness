
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, ''));
    if (!isNaN(value)) {
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      setSelectedDuration(
        Math.min(Math.max(value, minDuration), maxDuration)
      );
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-bgs-blue">Durée d'investissement</label>
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input 
            type="text" 
            value={selectedDuration.toString()}
            onChange={handleInputChange}
            className="pr-8 font-medium text-right"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bgs-blue font-medium">
            mois
          </span>
        </div>
      </div>
      
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
      
      <div className="flex justify-between text-xs text-bgs-blue/60">
        <span>Min: {Math.min(...durations)} mois</span>
        <span>Max: {Math.max(...durations)} mois</span>
      </div>
    </div>
  );
}
