// src/utils.ts
// Old utilities
export const API = (path: string) => `http://127.0.0.1:8000${path}`;

export const classNames = (...xs: (string | boolean | undefined)[]) =>
  xs.filter(Boolean).join(' ');

// Old formatters
export const pct = (x: number | undefined | null, d = 2) => (x === 0 || !!x) ? `${(Number(x) * 100).toFixed(d)}%` : '—';

export const num = (x: number | undefined | null) => (x === 0 || !!x) ? new Intl.NumberFormat().format(Number(x)) : '—';

export const months = (x: number | undefined | null) => (x === 0 || !!x) ? `${Number(x).toFixed(1)} mo` : '—';

export const formatMoney = (x: number | undefined | null, fd = 0) => {
  if (x === undefined || x === null) return '—';
 
  // Ensure fd is a valid integer between 0 and 20
  const fractionDigits = Math.max(0, Math.min(20, Math.floor(Number(fd) || 0)));
 
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fractionDigits,
  }).format(Number(x));
};

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

// New utilities from charts/utils.ts
// Basic quantile (expects sorted ascending input)
export function quantile(sorted: number[], q: number) {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + (sorted[base + 1] - sorted[base]) * (isNaN(rest) ? 0 : rest || 0);
}

// Compute quantiles (array) for each time index across a 2D matrix [paths][steps]
export function quantilesByStep(matrix: number[][], qs: number[]) {
  const steps = matrix[0]?.length ?? 0;
  const out: Record<string, number[]> = {};
  qs.forEach((q) => (out[q.toString()] = new Array(steps).fill(NaN)));
  for (let t = 0; t < steps; t++) {
    const col: number[] = [];
    for (let p = 0; p < matrix.length; p++) {
      const v = matrix[p]?.[t];
      if (typeof v === "number" && isFinite(v)) col.push(v);
    }
    col.sort((a, b) => a - b);
    qs.forEach((q) => {
      out[q.toString()][t] = quantile(col, q);
    });
  }
  return out;
}

// Simple histogram binning
export function makeHistogram(values: number[], binCount = 20) {
  if (!values?.length) return { bins: [] as { x0: number; x1: number; n: number }[], min: 0, max: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { bins: [{ x0: min, x1: max, n: values.length }], min, max };
  const step = (max - min) / binCount;
  const bins: { x0: number; x1: number; n: number }[] = [];
  for (let i = 0; i < binCount; i++) bins.push({ x0: min + i * step, x1: min + (i + 1) * step, n: 0 });
  for (const v of values) {
    let idx = Math.floor((v - min) / step);
    if (idx >= binCount) idx = binCount - 1; // include max value
    bins[idx].n++;
  }
  return { bins, min, max };
}

// Box/whisker stats
export function boxStats(values: number[]) {
  if (!values?.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return {
    min: s[0],
    q1: quantile(s, 0.25),
    median: quantile(s, 0.5),
    q3: quantile(s, 0.75),
    max: s[s.length - 1],
  };
}