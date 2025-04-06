
import { useState } from "react";
import { Notification } from "@/services/notifications";
import NotificationItem from "./NotificationItem";
import EmptyNotifications from "./EmptyNotifications";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  filter: 'all' | 'unread';
}

export default function NotificationsList({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  filter 
}: NotificationsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate total pages
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  
  // Get current notifications
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstItem, indexOfLastItem);

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
  
  if (notifications.length === 0) {
    return <EmptyNotifications filter={filter} />;
  }

  return (
    <div className="space-y-3">
      {/* Notifications list */}
      <div className="space-y-3">
        {currentNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
      
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
}
