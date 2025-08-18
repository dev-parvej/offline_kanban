import React from 'react';

type FormGroupProps = {
  label: string | React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  errorMessage?: string
};

const FormGroup = ({ label, htmlFor, children, errorMessage, className = '' }: FormGroupProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {errorMessage && <span className="text-red-500 text-sm">{errorMessage}</span>}
    </div>
  );
};

export default FormGroup;
