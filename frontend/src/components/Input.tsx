'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-dark-navy mb-2.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-text">{icon}</span>}
        <input
          className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20 transition-all duration-200 placeholder-gray-400 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  );
}
