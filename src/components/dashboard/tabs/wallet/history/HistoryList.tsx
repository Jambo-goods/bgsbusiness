
import React, { useState } from 'react';
import HistoryItem from './HistoryItem';
import { CombinedHistoryItem } from './useWalletHistory';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface HistoryListProps {
  items: CombinedHistoryItem[];
}

const HistoryList = ({ items }: HistoryListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  
  // Group current items by date
  const groupedItems: Record<string, CombinedHistoryItem[]> = {};
  
  currentItems.forEach(item => {
    const formattedDate = item.formattedDate;
    if (!groupedItems[formattedDate]) {
      groupedItems[formattedDate] = [];
    }
    groupedItems[formattedDate].push(item);
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list for better UX
    window.scrollTo(0, 0);
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="space-y-2">
          <h4 className="text-sm font-medium text-bgs-gray-medium mb-2">{date}</h4>
          <div className="space-y-2">
            {dateItems.map(item => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            {/* Previous button */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  href="#" 
                />
              </PaginationItem>
            )}
            
            {/* Page numbers */}
            {pageNumbers.map(number => {
              // Show only current page, first, last, and pages close to current
              if (
                number === 1 || 
                number === totalPages || 
                (number >= currentPage - 1 && number <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={number}>
                    <PaginationLink 
                      isActive={number === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(number);
                      }}
                      href="#"
                    >
                      {number}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for page breaks
              if (
                (number === 2 && currentPage > 3) || 
                (number === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={number}>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            {/* Next button */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  href="#" 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default HistoryList;
