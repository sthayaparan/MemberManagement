'use client';

import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-dark-navy mb-2.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-text pointer-events-none">{icon}</span>}
        <input
          id={inputId}
          className={`w-full py-3 pr-4 ${icon ? 'pl-10' : 'pl-4'} border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-primary focus:ring-2 focus:ring-blue-primary/20 transition-all duration-200 placeholder-gray-400 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  );
}
