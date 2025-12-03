import React from 'react';
import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'ghost',
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-gray-100',
    ghost: 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium',
  };

  return (
    <button
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 ${className}`}>
      {children}
    </div>
  );
};

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 ${className}`}>
      {children}
    </h2>
  );
};

interface PillProps {
  children: ReactNode;
  tone?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  className?: string;
}

export const Pill: React.FC<PillProps> = ({ children, tone = 'gray', className = '' }) => {
  const tones = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-200',
  } as const;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

interface StatProps {
  label: string;
  value: string | number;
  tone?: 'good' | 'bad' | 'neutral';
}

export const Stat: React.FC<StatProps> = ({ label, value, tone = 'neutral' }) => {
  const toneColors = {
    good: 'text-green-600 dark:text-green-400',
    bad: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-900 dark:text-gray-100',
  };

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
  className={`
    text-xl font-bold leading-snug tracking-tight
    ${toneColors[tone]}
  `}
>
  {value}
</p>

    </div>
  );
};