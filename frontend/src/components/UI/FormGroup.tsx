import React from 'react';

type FormGroupProps = {
  label: string | React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  errorMessage?: string;
  isDarkMode?: boolean;
};

const FormGroup = ({ label, htmlFor, children, errorMessage, className = '', isDarkMode = false }: FormGroupProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={htmlFor} 
        className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label}
      </label>
      {children}
      {errorMessage && (
        <span className={`text-sm ${
          isDarkMode ? 'text-red-400' : 'text-red-500'
        }`}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default FormGroup;
