import React, { ReactNode } from 'react';

export type TabProps = {
  title: string;
  titleClass?: string;
  activeclass?: string;
  children: ReactNode;
};

export const Tab = ({ children, activeclass, ...ar }: TabProps) => {
  return <div {...ar}>{children}</div>;
};
