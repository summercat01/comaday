'use client'

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'profile' | 'ranking';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'profile':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="h-4 bg-gray-400 rounded w-16"></div>
                <div className="h-4 bg-gray-400 rounded w-20"></div>
                <div className="h-4 bg-gray-400 rounded w-24"></div>
              </div>
            </div>
          </div>
        );
      
      case 'ranking':
        return (
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded-xl overflow-hidden">
              <div className="bg-gray-400 p-4">
                <div className="h-6 bg-gray-500 rounded w-24 mx-auto"></div>
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-400 rounded w-8"></div>
                    <div className="h-4 bg-gray-400 rounded flex-1"></div>
                    <div className="h-4 bg-gray-400 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-xl p-4">
                <div className="h-5 bg-gray-400 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        );
      
      default: // card
        return (
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded-xl p-8 text-center">
              <div className="h-8 bg-gray-400 rounded w-32 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-400 rounded w-48 mx-auto"></div>
            </div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;
