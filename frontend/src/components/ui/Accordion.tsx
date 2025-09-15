'use client';
import { ReactNode, useRef, useState, useEffect } from 'react';
import { ChevronDown } from './Icons/ChevronDown';

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  isOpen?: boolean; // controlled open
  onToggle?: (open: boolean) => void; // notify toggle
};

export const AccordionItem = ({
  title,
  children,
  isOpen: controlledOpen,
  onToggle,
}: AccordionItemProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // If controlled, use the prop; else use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const toggleAccordion = () => {
    if (controlledOpen !== undefined) {
      onToggle?.(!controlledOpen);
    } else {
      setInternalOpen(prev => !prev);
    }
  };

  // On external open/close change, recalculate height
  useEffect(() => {
    if (contentRef.current && isOpen) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
    } else if (contentRef.current) {
      contentRef.current.style.maxHeight = '0px';
    }
  }, [isOpen, children]);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={toggleAccordion}
        className="w-full flex items-center justify-between text-left px-4 py-3 text-sm sm:text-base font-medium text-gray-800 hover:bg-gray-50 focus:outline-none"
      >
        <span>{title}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        ref={contentRef}
        className={`overflow-visible transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight + 'px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
};

type AccordionProps = {
  children: ReactNode;
  className?: string;
};

const Accordion = ({ children, className = '' }: AccordionProps) => {
  return <div className={`w-full rounded-md shadow-sm ${className}`}>{children}</div>;
};

export default Accordion;
