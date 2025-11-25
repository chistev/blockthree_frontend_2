const API = (path: string) => `http://127.0.0.1:8000${path}`;

// ———————— Formatting Helpers ————————
const formatMoney = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(val);
};

const pct = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '0%';
  return `${(val * 100).toFixed(2)}%`;
};

const num = (val: number | null | undefined, decimals: number = 2): string => {
  if (val === null || val === undefined) return '0';
  return Number(val).toFixed(decimals);
};

const months = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '0 mo';
  return `${Number(val).toFixed(1)} mo`;
};

// ———————— Risk Level Color ————————
const riskTone = (prob: number | null | undefined): 'green' | 'yellow' | 'red' => {
  if (prob === null || prob === undefined || prob < 0.05) return 'green';
  if (prob < 0.15) return 'yellow';
  return 'red';
};

// ———————— Structure Label Mapping ————————
const structureLabel = (structure: string | undefined): string => {
  if (!structure) return 'Unknown';

  const s = structure.toLowerCase();

  if (s.includes('atm')) return 'ATM';
  if (s.includes('pipe')) return 'PIPE';
  if (s.includes('loan') && !s.includes('convert')) return 'Loan';
  if (s.includes('convert')) return 'Convertible';
  if (s.includes('hybrid') || s.includes('+')) return 'Hybrid';
  if (s.includes('hedged')) return 'Hedged Loan';

  return structure.split(' ')[0] || 'Option';
};

// ———————— ClassName Helper (optional but very useful) ————————
const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Export all utilities
export {
  API,
  formatMoney,
  pct,
  num,
  months,
  riskTone,
  structureLabel,
  classNames,
};
