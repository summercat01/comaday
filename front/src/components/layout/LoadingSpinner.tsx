'use client'

import React from 'react';
import { Card } from '../ui';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '로딩 중...',
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="text-center">
      <div className={`loading-spinner mx-auto mb-4 ${sizeClasses[size]}`}></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card>
          {content}
        </Card>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
