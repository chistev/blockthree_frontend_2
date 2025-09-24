import React, { useState } from 'react'
import { classNames } from '../utils'

export default function AssumptionGrid({ assumptions, setAssumptions, groupFields }: { assumptions: any, setAssumptions: (a: any) => void, groupFields?: string[] }) {
  if (!assumptions) return null;
  const keys = groupFields || Object.keys(assumptions || {}).filter(k => ['number', 'string', 'boolean'].includes(typeof assumptions[k]));
  
  const Field = ({ k }: { k: string }) => {
    const [inputValue, setInputValue] = useState(assumptions[k] ?? '');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setInputValue(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    };
    
    const handleCommit = () => {
      const value = typeof assumptions[k] === 'number' ? Number(inputValue) : inputValue;
      setAssumptions({ ...assumptions, [k]: value });
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCommit();
      }
    };
    
    const val = assumptions[k];
    
    // Special case for hedge_policy to use a dropdown
    if (k === 'hedge_policy') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
          >
            <option value="none">None</option>
            <option value="protective_put">Protective Put</option>
          </select>
        </label>
      );
    }
    
    // Special case for objective_preset to use a dropdown
    if (k === 'objective_preset') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
          >
            <option value="Defensive">Defensive</option>
            <option value="Balanced">Balanced</option>
            <option value="Growth">Growth</option>
          </select>
        </label>
      );
    }
    
    // Special case for deribit_iv_source to use a dropdown
    if (k === 'deribit_iv_source') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <select
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
          >
            <option value="manual">Manual</option>
            <option value="live">Live</option>
          </select>
        </label>
      );
    }
    
    // Read-only field for BTC_current_market_price
    if (k === 'BTC_current_market_price') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <input
            type="number"
            value={inputValue}
            readOnly
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-gray-100 dark:bg-zinc-900 cursor-not-allowed"
          />
        </label>
      );
    }
    
    if (typeof val === 'number') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
          />
        </label>
      );
    }
    
    if (typeof val === 'boolean') {
      return (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
          <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
          <input
            type="checkbox"
            checked={!!inputValue}
            onChange={handleChange}
            onBlur={handleCommit}
            className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
          />
        </label>
      );
    }
    
    return (
      <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-zinc-700 p-3">
        <div className="text-[14px] text-gray-600 dark:text-gray-300">{k}</div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="w-48 rounded-lg border-gray-300 dark:border-zinc-600 px-3 py-2 text-right bg-white dark:bg-zinc-800"
        />
      </label>
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {keys.map((k) => <Field key={k} k={k} />)}
    </div>
  );
}