'use client';

import React, { useEffect } from 'react';
import classNames from 'classnames';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
};

export const Modal = ({ isOpen, onClose, children, className = '', isDarkMode = false }: ModalProps) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-black/70' : 'bg-black/50'}`} 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div
        className={classNames(
          'relative z-10 rounded-lg shadow-lg max-w-md w-full p-6',
          isDarkMode 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 transition-colors ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label="Close Modal"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};
