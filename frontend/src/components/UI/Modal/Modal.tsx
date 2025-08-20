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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 z-0 bg-black/50 dark:bg-black/70" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div
        className={classNames(
          'relative z-10 rounded-lg shadow-lg max-w-md w-full mx-4',
          'bg-white text-gray-900 dark:bg-gray-800 dark:text-white',
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

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
