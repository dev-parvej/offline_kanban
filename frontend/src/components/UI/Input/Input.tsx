'use client';

import React, { useState, forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  tooltipMessage?: string;
  isDarkMode?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', className = '', tooltipMessage, isDarkMode = false, onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    // Base styles for light and dark modes
    const baseStyles = isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500';

    // Tooltip styles for light and dark modes
    const tooltipStyles = isDarkMode
      ? 'bg-gray-900 text-gray-100 border border-gray-700'
      : 'bg-gray-800 text-white';

    return (
      <div className="relative w-full">
        {/* Tooltip */}
        {tooltipMessage && isFocused && (
          <div className={`absolute bottom-full left-0 mb-2 w-full max-w-xs text-xs rounded-md px-3 py-2 z-20 break-words shadow-lg ${tooltipStyles}`}>
            {tooltipMessage}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${baseStyles} ${className}`}
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
