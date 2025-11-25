import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white border-[0.5px] border-blue-500",
    secondary:
      "bg-gray-600 hover:bg-gray-700 text-white border-[0.5px] border-gray-500",
    danger:
      "bg-red-600 hover:bg-red-700 text-white border-[0.5px] border-red-500",
    ghost:
      "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-[0.5px] border-gray-300 dark:border-gray-600",
    outline:
      "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-[0.5px] border-blue-600 dark:border-blue-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
        variants[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border-[0.5px] border-gray-200 dark:border-zinc-800 ${className}`}
  >
    {children}
  </div>
);

interface SectionTitleProps {
  children: React.ReactNode;
  right?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  right,
}) => (
  <div className="flex justify-between items-center mb-6 pb-3 border-b-[0.5px] border-gray-200 dark:border-zinc-800">
    <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
      {children}
    </h2>
    {right && <div>{right}</div>}
  </div>
);

type PillTone =
  | "blue"
  | "gray"
  | "violet"
  | "green"
  | "red"
  | "yellow"
  | "pale-green"
  | "pale-blue";

interface PillProps {
  children: React.ReactNode;
  tone?: PillTone;
}

export const Pill: React.FC<PillProps> = ({ children, tone = "blue" }) => {
  const tones: Record<PillTone, string> = {
    blue:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-[0.5px] border-blue-200 dark:border-blue-800",
    gray:
      "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-[0.5px] border-gray-200 dark:border-gray-700",
    violet:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-[0.5px] border-purple-200 dark:border-purple-800",
    green:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-[0.5px] border-green-200 dark:border-green-800",
    red:
      "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-[0.5px] border-red-200 dark:border-red-800",
    yellow:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-[0.5px] border-yellow-200 dark:border-yellow-800",
    "pale-green":
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-[0.5px] border-green-100 dark:border-green-900",
    "pale-blue":
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-[0.5px] border-blue-100 dark:border-blue-900",
  };

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};

type StatTone = "red" | "green" | "gray";

interface StatProps {
  label: string;
  value: string | number;
  tone?: StatTone;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  tone = "gray",
}) => (
  <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border-[0.5px] border-gray-200 dark:border-zinc-800">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 tracking-wide uppercase">
      {label}
    </div>
    <div
      className={`text-2xl font-semibold tracking-tight ${
        tone === "red"
          ? "text-red-600"
          : tone === "green"
          ? "text-green-600"
          : "text-gray-900 dark:text-white"
      }`}
    >
      {value}
    </div>
  </div>
);

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
}) => (
  <div className={`mb-3 ${className}`}>
    {label && (
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm border-[0.5px] border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
    />
  </div>
);

// Optional: barrel export for convenience
export default {
  Button,
  Card,
  SectionTitle,
  Pill,
  Stat,
  Input,
};