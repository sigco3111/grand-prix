
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:outline-none focus:ring-4';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800',
    secondary: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-300 dark:focus:ring-green-800',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300 dark:focus:ring-red-800',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface StatDisplayProps {
    icon: string;
    label: string;
    value: string | number;
    color: string;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({ icon, label, value, color }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <span className={`font-medium text-gray-600 dark:text-gray-400`}>{label}:</span>
            <span className={`font-bold text-lg ${color}`}>{value}</span>
        </div>
    );
};