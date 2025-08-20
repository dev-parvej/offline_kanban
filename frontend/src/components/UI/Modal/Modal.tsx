'use client';

import React, { useEffect } from 'react';
import classNames from 'classnames';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-black/50 dark:bg-black/70" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div
        className={classNames(
          'relative z-10 rounded-lg shadow-lg max-w-md w-full',
          'bg-white text-gray-900 dark:bg-gray-800 dark:text-white',
          'max-h-[90vh] flex flex-col',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close Modal"
        >
          ✕
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
        
        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgb(156 163 175) transparent;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(156 163 175);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(107 114 128);
            background-clip: padding-box;
          }

          /* Dark mode styles */
          :global(.dark) .custom-scrollbar {
            scrollbar-color: rgb(75 85 99) transparent;
          }

          :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(75 85 99);
          }

          :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(107 114 128);
          }

          /* Smooth scrolling */
          .custom-scrollbar {
            scroll-behavior: smooth;
          }

          /* Hide scrollbar on mobile for cleaner look */
          @media (max-width: 768px) {
            .custom-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
