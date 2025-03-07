
import React from "react";
import { SearchIcon, FilterIcon, ArrowUpDownIcon } from "lucide-react";

interface SearchAndFilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterActive: boolean;
  setFilterActive: (active: boolean) => void;
  showSortMenu: boolean;
  setShowSortMenu: (show: boolean) => void;
  setSortBy: (sortBy: string) => void;
}

export default function SearchAndFilterControls({
  searchTerm,
  setSearchTerm,
  filterActive,
  setFilterActive,
  showSortMenu,
  setShowSortMenu,
  setSortBy
}: SearchAndFilterControlsProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
        <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-bgs-gray-medium h-3.5 w-3.5" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-7 pr-3 py-1.5 w-full border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-bgs-orange"
        />
      </div>
      
      <button 
        onClick={() => setFilterActive(!filterActive)}
        className={`p-1.5 rounded-md border ${filterActive ? 'bg-bgs-blue text-white border-bgs-blue' : 'border-gray-200 text-bgs-gray-medium'}`}
      >
        <FilterIcon className="h-3.5 w-3.5" />
      </button>
      
      <div className="relative">
        <button 
          className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium"
          onClick={() => setShowSortMenu(!showSortMenu)}
        >
          <ArrowUpDownIcon className="h-3.5 w-3.5" />
        </button>
        {showSortMenu && (
          <div className="absolute right-0 mt-1 w-40 bg-white shadow-md rounded-md border border-gray-100 z-10">
            <div className="p-1">
              <button 
                onClick={() => {
                  setSortBy("date");
                  setShowSortMenu(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
              >
                Date (récent)
              </button>
              <button 
                onClick={() => {
                  setSortBy("name");
                  setShowSortMenu(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
              >
                Nom (A-Z)
              </button>
              <button 
                onClick={() => {
                  setSortBy("yield");
                  setShowSortMenu(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
              >
                Rendement (élevé-bas)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
