'use client'

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'input-field',
    fullWidth ? 'w-full' : '',
    error ? 'border-error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-title)' }}>
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const textareaClasses = [
    'input-field',
    fullWidth ? 'w-full' : '',
    error ? 'border-error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-title)' }}>
          {label}
        </label>
      )}
      <textarea
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
