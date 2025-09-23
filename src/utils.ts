
export const API = (path: string) => `https://cperez.pythonanywhere.com${path}`;

export const classNames = (...xs: (string | boolean | undefined)[]) =>
  xs.filter(Boolean).join(' ');

// Formatters
export const pct = (x: number | undefined | null, d = 2) => (x === 0 || !!x) ? `${(Number(x) * 100).toFixed(d)}%` : '—';
export const num = (x: number | undefined | null) => (x === 0 || !!x) ? new Intl.NumberFormat().format(Number(x)) : '—';
export const months = (x: number | undefined | null) => (x === 0 || !!x) ? `${Number(x).toFixed(1)} mo` : '—';
export const formatMoney = (x: number | undefined | null, fd = 0) => (x === 0 || !!x)
  ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: fd }).format(Number(x))
  : '—';

// Risk thresholds
export const RISK = { ltv: { green: 0.05, amber: 0.10 }, dil: { green: 0.08, amber: 0.12 } };

export function riskTone({ ltvProb, avgDilution }: { ltvProb?: number, avgDilution?: number }) {
  let tone: 'good' | 'amber' | 'red' = 'good';
  let pill = 'Within guardrails';
  if (ltvProb !== undefined) {
    if (ltvProb > RISK.ltv.amber) { tone = 'red'; pill = 'LTV breach risk'; }
    else if (ltvProb >= RISK.ltv.green) { tone = 'amber'; pill = 'Moderate LTV risk'; }
  }
  if (avgDilution !== undefined) {
    if (avgDilution > RISK.dil.amber) { tone = tone === 'red' ? 'red' : 'amber'; pill = tone === 'red' ? pill : 'Dilution risk'; }
    else if (avgDilution >= RISK.dil.green && tone === 'good') { tone = 'amber'; pill = 'Dilution risk'; }
  }
  return { tone, pill };
}

export function structureLabel(ts: any = {}) {
  const s = (ts?.structure || ts?.type || '').toLowerCase();
  if (s.includes('atm')) return { label: 'ATM', tone: 'blue' };
  if (s.includes('pipe')) return { label: 'PIPE', tone: 'amber' };
  if (s.includes('loan')) return { label: 'Loan', tone: 'green' };
  if (s.includes('convert')) return { label: 'Convertible', tone: 'violet' };
  if ('slippage' in ts || 'atm_pct_adv' in ts) return { label: 'ATM', tone: 'blue' };
  if ('pipe_discount' in ts) return { label: 'PIPE', tone: 'amber' };
  if ('rate' in ts && !('conversion_premium' in ts)) return { label: 'Loan', tone: 'green' };
  if ('conversion_premium' in ts) return { label: 'Convertible', tone: 'violet' };
  return { label: ts?.structure || ts?.type || 'Option', tone: 'gray' };
}
