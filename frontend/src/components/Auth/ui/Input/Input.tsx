'use client';

import React, { useState, forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  tooltipMessage?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', className = '', tooltipMessage, onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        {/* Tooltip */}
        {tooltipMessage && isFocused && (
          <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs text-xs rounded-md px-3 py-2 z-20 break-words shadow-lg bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-700">
            {tooltipMessage}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
