import React from 'react';
import classNames from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 border-gray-100 hover:bg-gray-200 hover:border-gray-200 focus:ring-gray-500',
  outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500',
  ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-500',
  warning: 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 hover:border-yellow-700 focus:ring-yellow-500',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-500',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'px-2.5 py-1.5 text-xs font-medium',
  sm: 'px-3 py-2 text-sm font-medium',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-medium',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      disabled={loading || rest.disabled}
      className={classNames(
        'border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        {
          'w-full': fullWidth,
        },
        className
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
