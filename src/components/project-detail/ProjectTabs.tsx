
import React from "react";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  activeTab: 'overview' | 'documents' | 'updates';
  setActiveTab: (tab: 'overview' | 'documents' | 'updates') => void;
}

export default function ProjectTabs({ activeTab, setActiveTab }: ProjectTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
            activeTab === 'overview' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          Aperçu
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={cn(
            "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
            activeTab === 'documents' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          Documents
        </button>
        <button 
          onClick={() => setActiveTab('updates')}
          className={cn(
            "py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-px",
            activeTab === 'updates' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          Mises à jour
        </button>
      </div>
    </div>
  );
}
