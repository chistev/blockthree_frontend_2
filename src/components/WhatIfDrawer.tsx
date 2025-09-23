
import React, { useState } from 'react'
import { Card, SectionTitle, Pill, Button } from './Primitives'
import { ToastContainer, toast } from 'react-toastify'

export default function WhatIfDrawer({ assumptions, snapshotId, onRun, setIsOpen }: any) {
  const [shock, setShock] = useState(-0.2);

  const handleStress = async () => {
    if (!snapshotId) return;
    try {
      await onRun({ param: 'btc_shock', value: shock });
      toast.success('Stress test completed');
    } catch {
      toast.error('Stress test failed');
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-zinc-900 p-4 shadow-lg z-50">
      <Button onClick={() => setIsOpen(false)} variant="danger" className="mb-4">Close</Button>
      <BespokePanel assumptions={assumptions} snapshotId={snapshotId} onRun={onRun} />
      <StressPanel shock={shock} setShock={setShock} onRun={handleStress} />
      <ToastContainer />
    </div>
  )
}

function BespokePanel({ assumptions, snapshotId, onRun }: any) {
  const [param, setParam] = useState(Object.keys(assumptions)[0] || '');
  const [value, setValue] = useState('');

  return (
    <Card>
      <SectionTitle right={<Pill tone="blue">Bespoke / What-If</Pill>}>Override Parameter</SectionTitle>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-[14px]">
          Param
          <select value={param} onChange={(e) => setParam(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1 bg-white dark:bg-zinc-800 dark:border-zinc-600">
            {Object.keys(assumptions).filter(k => typeof assumptions[k] === 'number').map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-[14px]">
          Value
          <input className="mt-1 w-full rounded-lg border px-2 py-1 bg-white dark:bg-zinc-800 dark:border-zinc-600" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <div className="flex items-end">
          <Button onClick={() => onRun({ param, value: Number(value) })} variant="success" disabled={!value}>Run What-If</Button>
        </div>
      </div>
      <p className="text-[12px] text-gray-500 mt-2">Uses /api/what_if/ with current snapshot. No fabricated params.</p>
    </Card>
  )
}

function StressPanel({ shock, setShock, onRun }: any) {
  return (
    <Card>
      <SectionTitle right={<Pill tone="amber">Stress Test</Pill>}>Market Shock</SectionTitle>
      <div className="flex items-center gap-3 text-[14px]">
        <span>BTC Shock</span>
        <input type="number" step="0.05" value={shock} onChange={(e) => setShock(Number(e.target.value))} className="w-24 rounded-lg border px-2 py-1 bg-white dark:bg-zinc-800 dark:border-zinc-600 text-right" />
        <span className="text-[12px] text-gray-500">e.g., -0.20 = -20%</span>
        <Button onClick={onRun} variant="primary" disabled={!shock}>Run Stress</Button>
      </div>
    </Card>
  )
}
