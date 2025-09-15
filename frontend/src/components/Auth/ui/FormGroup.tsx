import React from 'react';

type FormGroupProps = {
  label: string | React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  errorMessage?: string;
};

const FormGroup = ({ label, htmlFor, children, errorMessage, className = '' }: FormGroupProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      {children}
      {errorMessage && (
        <span className="text-sm text-red-500 dark:text-red-400">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default FormGroup;
