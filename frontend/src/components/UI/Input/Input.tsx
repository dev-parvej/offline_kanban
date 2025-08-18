'use client';

import React, { useState, useRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  tooltipMessage?: string;
};

export const Input = ({ type = 'text', className = '', tooltipMessage, ...rest }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      {/* Tooltip */}
      {tooltipMessage && isFocused && (
        <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-gray-800 text-white text-xs rounded-md px-3 py-2 z-20 break-words shadow">
          {tooltipMessage}
        </div>
      )}

      <input
        ref={inputRef}
        type={type}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        onFocus={e => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
    </div>
  );
};
