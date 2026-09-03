'use client';

import { HiOutlineXMark } from 'react-icons/hi2';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  isDanger = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white rounded-t-xl">
          <h2 className="text-lg font-bold text-dark-navy">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-text hover:text-dark-navy transition-colors"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 text-gray-text">{children}</div>
        <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-b-xl flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={isDanger ? 'danger' : 'primary'}
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
