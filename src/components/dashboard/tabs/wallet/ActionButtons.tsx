
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function ActionButtons({ onDeposit, onWithdraw }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={onDeposit}
        className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Déposer des fonds
      </Button>
      
      <Button 
        onClick={onWithdraw}
        variant="outline"
        className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10"
      >
        <Download className="h-4 w-4 mr-2" />
        Retirer des fonds
      </Button>
    </div>
  );
}
