'use client';

import React, { useState } from 'react';
import classNames from 'classnames';
import type { TabProps } from './Tab';

type TabsProps = {
  children: React.ReactElement<TabProps>[];
  headerClass?: string;
  rightTab?: React.ReactElement;
};

export const Tabs = ({ children, headerClass = '', rightTab }: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = children[activeIndex];

  return (
    <div className="w-full">
      {/* Tab Header Row */}
      <div className={`relative flex justify-between pr-2 ${headerClass}`}>
        <div>
          {children.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={classNames(
                  'px-4 py-2 text-sm rounded-t-md border border-b-0 transition-all duration-200',
                  isActive
                    ? tab?.props.activeclass || 'bg-white text-blue-600 border-blue-500'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
                  tab?.props.titleClass
                )}
                style={{
                  position: 'relative',
                  top: '1px', // pushes button down to perfectly align with container
                }}
              >
                {tab?.props.title}
              </button>
            );
          })}
        </div>
        <div>{rightTab}</div>
      </div>

      {/* Content container with border */}
      <div className="relative z-0 border-t-2 border-gray-100 rounded-md rounded-t-none">
        {activeTab}
      </div>
    </div>
  );
};
