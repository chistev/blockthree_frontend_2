import React from 'react';
import { classNames } from '../utils';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={classNames('rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-md p-5 hover:scale-[1.01] transition border border-gray-200/60 dark:border-zinc-900/60 backdrop-blur', className)}>
    {children}
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-inter-tight text-[22px] font-semibold tracking-tight">{children}</h3>
    {right}
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'subtle' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }) => {
  const base = 'px-4 py-2 rounded-md font-ibm-plex-sans text-[14px] font-medium transition active:scale-[0.98]';
  const styles: Record<string, string> = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-gray-300',
    ghost: 'border border-gray-300 hover:bg-gray-50',
    subtle: 'bg-gray-100 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classNames(base, styles[variant], className)}>
      {children}
    </button>
  );
};

export const Pill: React.FC<{
  tone?: 'gray' | 'red' | 'amber' | 'green' | 'blue' | 'violet';
  children: React.ReactNode;
}> = ({ tone = 'gray', children }) => {
  const tones: Record<string, string> = {
    gray: 'bg-gray-400 text-white',
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    green: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    violet: 'bg-violet-500 text-white',
  };
  return <span className={classNames('inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium', tones[tone])}>
    {children}
  </span>;
};

export const Stat: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'good' | 'amber' | 'red' | 'neutral' | 'warn';
}> = ({ label, value, hint, tone = 'neutral' }) => (
  <div className="flex flex-col">
    <span className="font-ibm-plex-sans text-[12px] text-gray-500">{label}</span>
    <span className={classNames(
      'font-roboto-mono text-[26px] font-bold tabular-nums',
      tone === 'red' && 'text-red-500',
      tone === 'amber' && 'text-amber-500',
      tone === 'good' && 'text-emerald-500',
      tone === 'neutral' && 'text-gray-500'
    )}>{value}</span>
    {hint && <span className="font-ibm-plex-sans text-[11px] text-gray-400">{hint}</span>}
  </div>
);