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
          <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-gray-800 text-white text-xs rounded-md px-3 py-2 z-20 break-words shadow">
            {tooltipMessage}
          </div>
        )}

        <input
          ref={ref} // ✅ Forward the ref here!
          type={type}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
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
