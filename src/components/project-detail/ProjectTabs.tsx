
import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Info, Clock } from "lucide-react";

interface ProjectTabsProps {
  activeTab: 'overview' | 'documents' | 'updates';
  setActiveTab: (tab: 'overview' | 'documents' | 'updates') => void;
}

export default function ProjectTabs({ activeTab, setActiveTab }: ProjectTabsProps) {
  return (
    <div className="mb-8 animate-fade-up">
      <div className="flex w-full border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "py-4 px-8 font-medium text-sm transition-colors border-b-2 -mb-px flex items-center justify-center flex-1",
            activeTab === 'overview' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          <Info className={cn(
            "mr-2 h-4 w-4",
            activeTab === 'overview' ? "text-bgs-orange" : "text-bgs-blue/60"
          )} />
          Aperçu
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={cn(
            "py-4 px-8 font-medium text-sm transition-colors border-b-2 -mb-px flex items-center justify-center flex-1",
            activeTab === 'documents' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          <FileText className={cn(
            "mr-2 h-4 w-4",
            activeTab === 'documents' ? "text-bgs-orange" : "text-bgs-blue/60"
          )} />
          Documents
        </button>
        <button 
          onClick={() => setActiveTab('updates')}
          className={cn(
            "py-4 px-8 font-medium text-sm transition-colors border-b-2 -mb-px flex items-center justify-center flex-1",
            activeTab === 'updates' 
              ? "border-bgs-orange text-bgs-orange" 
              : "border-transparent text-bgs-blue/60 hover:text-bgs-blue"
          )}
        >
          <Clock className={cn(
            "mr-2 h-4 w-4",
            activeTab === 'updates' ? "text-bgs-orange" : "text-bgs-blue/60"
          )} />
          Mises à jour
        </button>
      </div>
    </div>
  );
}
