const API = (path: string) => `http://127.0.0.1:8000${path}`;

// ———————— Formatting ————————
const formatMoney = (val: number | null | undefined) => {
  if (val === null || val === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(val);
};

const pct = (val: number | null | undefined) => {
  if (val === null || val === undefined) return '0%';
  return `${(val * 100).toFixed(2)}%`;
};

const num = (val: number | null | undefined, decimals = 2) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toFixed(decimals);
};

const months = (val: number | null | undefined) => {
  if (val === null || val === undefined) return '0 mo';
  return `${Number(val).toFixed(1)} mo`;
};

// ———————— Risk Color ————————
const riskTone = (prob: number | null | undefined) => {
  if (prob === null || prob === undefined) return 'green';
  if (prob < 0.05) return 'green';
  if (prob < 0.15) return 'yellow';
  return 'red';
};

// ———————— Structure Labels ————————
const structureLabel = (structure: string | undefined) => {
  if (!structure) return { label: 'Unknown', tone: 'gray' } as const;

  const s = structure.toLowerCase();

  if (s.includes('atm')) return { label: 'ATM', tone: 'blue' } as const;
  if (s.includes('pipe')) return { label: 'PIPE', tone: 'amber' } as const;
  if (s.includes('loan') && !s.includes('convert')) return { label: 'Loan', tone: 'green' } as const;
  if (s.includes('convert')) return { label: 'Convertible', tone: 'violet' } as const;
  if (s.includes('hybrid') || s.includes('+')) return { label: 'Hybrid', tone: 'indigo' } as const;
  if (s.includes('hedged')) return { label: 'Hedged Loan', tone: 'emerald' } as const;

  return { label: structure.split(' ')[0] || 'Option', tone: 'gray' } as const;
};

// ———————— Optional: simple className helper (very useful) ————————
const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Export everything
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