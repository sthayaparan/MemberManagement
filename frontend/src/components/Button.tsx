'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  children,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap';

  const variants = {
    primary: 'bg-gradient-to-r from-purple-secondary to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-blue-primary to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-primary text-blue-primary bg-white hover:bg-blue-50 shadow-sm hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-dark-navy',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm font-medium',
    md: 'px-4 py-2.5 text-base font-medium',
    lg: 'px-6 py-3 text-lg font-semibold',
  };

  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  const iconElement = icon && (
    <span className="flex items-center justify-center">{icon}</span>
  );

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && iconElement}
          {children}
          {icon && iconPosition === 'right' && iconElement}
        </>
      )}
    </button>
  );
}
