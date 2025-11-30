import { toast } from 'react-toastify';

export const API = (endpoint: string): string => endpoint;

export const authFetch = async (url: string, options: RequestInit = {}, token?: string | null): Promise<Response> => {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export const formatMoney = (value: number | null | undefined, decimals = 0): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const pct = (value: number | null | undefined, decimals = 2): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const num = (value: number | null | undefined, decimals = 2): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const months = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)} mo`;
};

export const riskTone = (prob: number | null | undefined): 'good' | 'bad' | 'neutral' => {
  if (prob == null || isNaN(prob)) return 'neutral';
  if (prob <= 0.05) return 'good';
  if (prob <= 0.20) return 'neutral';
  return 'bad';
};

export const structureLabel = (structure: string | null | undefined): string => {
  if (!structure) return 'Unknown';
  const map: Record<string, string> = {
    loan: 'BTC-Backed Loan',
    convertible: 'Convertible Note',
    pipe: 'PIPE',
    atm: 'At-The-Market (ATM)',
    hybrid: 'Hybrid',
    'hybrid balanced': 'Hybrid Balanced',
    'hybrid defensive': 'Hybrid Defensive',
    'hybrid growth': 'Hybrid Growth',
    Loan: 'BTC-Backed Loan',
    Convertible: 'Convertible Note',
    PIPE: 'PIPE',
    ATM: 'At-The-Market (ATM)',
    Hybrid: 'Hybrid',
  };
  const lower = structure.toLowerCase();
  return map[lower] || structure.charAt(0).toUpperCase() + structure.slice(1);
};

export const toastError = (msg: string) => toast.error(msg);
export const toastSuccess = (msg: string) => toast.success(msg);
export const toastInfo = (msg: string) => toast.info(msg);

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));