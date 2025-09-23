
import React from 'react'
import { classNames } from '../utils'

export default function AssumptionGrid({ assumptions, setAssumptions, groupFields }: { assumptions: any, setAssumptions: (a: any) => void, groupFields?: string[] }) {
  if (!assumptions) return null;
  const keys = groupFields || Object.keys(assumptions || {}).filter(k => ['number','string','boolean'].includes(typeof assumptions[k]));
  const onChange = (k: string, v: any) => setAssumptions({ ...assumptions, [k]: v });

  const Field = ({ k }: { k: string }) => {
    const val = assumptions[k];
    if (typeof val === 'number') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <input type="number" value={val} onChange={(e) => onChange(k, Number(e.target.value))} className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800" />
        </label>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <input type="checkbox" checked={!!val} onChange={(e) => onChange(k, e.target.checked)} />
        </label>
      );
    }
    return (
      <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
        <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
        <input type="text" value={val ?? ''} onChange={(e) => onChange(k, e.target.value)} className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800" />
      </label>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {keys.map((k) => <Field key={k} k={k} />)}
    </div>
  );
}
