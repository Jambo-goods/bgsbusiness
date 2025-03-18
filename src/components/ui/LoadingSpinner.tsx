
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'orange' | 'gray';
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const colorClasses = {
    blue: 'border-bgs-blue',
    orange: 'border-bgs-orange',
    gray: 'border-gray-300'
  };
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label="Loading"
    ></div>
  );
}
