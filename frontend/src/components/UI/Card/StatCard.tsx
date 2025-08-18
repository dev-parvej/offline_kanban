'use client';

import React from 'react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  titleClass?: string;
  valueClass?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  className = '',
  titleClass = '',
  valueClass = '',
}: StatCardProps) => {
  return (
    <div
      className={`flex items-center p-4 bg-white shadow rounded-2xl border w-full max-w-sm ${className}`}
    >
      <div className="text-blue-600 bg-blue-100 p-2 rounded-full">{icon}</div>
      <div className="ml-4">
        <div className={`text-sm ${titleClass ? titleClass : 'text-gray-500'}`}>{title}</div>
        <div className={`text-xl font-bold ${valueClass ? valueClass : 'text-gray-800'}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
