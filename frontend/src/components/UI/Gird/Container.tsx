import React from 'react';

export default function Container({
  isFluid,
  children,
}: {
  isFluid?: boolean;
  children: React.ReactNode;
}) {
  if (isFluid) {
    return <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
  }
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
}
