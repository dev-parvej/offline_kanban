import React, { ReactNode } from 'react';

export const CardBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
};
