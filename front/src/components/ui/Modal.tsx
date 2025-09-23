'use client'

import React from 'react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  closeOnBackdropClick = true,
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <Card
        className={`w-full ${maxWidthClasses[maxWidth]} animate-slide-up`}
        padding="lg"
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-title)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-text-light)' }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </Card>
    </div>
  );
};

export default Modal;
