'use client'

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-xl font-semibold transition-all duration-200 hover-lift focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  const variantClasses = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    disabled: 'btn-disabled',
  };

  const sizeClasses = {
    sm: 'text-xs sm:text-sm py-2 px-3',
    md: 'text-sm sm:text-base py-3 px-4',
    lg: 'text-base sm:text-lg py-4 px-6',
  };

  const classes = [
    baseClasses,
    variantClasses[disabled || loading ? 'disabled' : variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="loading-spinner w-4 h-4"></div>
          <span>로딩 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
