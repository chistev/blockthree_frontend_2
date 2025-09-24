import React, { useEffect, useMemo, useState } from 'react'
import Landing from './pages/Landing'
import Assumptions from './pages/Assumptions'
import DecisionView from './components/DecisionView'
import AuditPanel from './components/AuditPanel'
import { Button } from './components/Primitives'
import { API } from './utils'
import { debounce } from 'lodash'
import { Machine, interpret } from 'xstate'
import { ToastContainer, toast } from 'react-toastify'

export default function App() {
  const [page, setPage] = useState('landing');
  const [dark, setDark] = useState(true);
  const [assumptions, setAssumptions] = useState<any>({});
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState('private');
  const [ticker, setTicker] = useState('');
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  // Handle dark mode class on html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const runModelMachine = Machine({
    id: 'runModel',
    initial: 'idle',
    states: {
      idle: { on: { RUN: 'locking' } },
      locking: { on: { LOCKED: 'running', ERROR: 'error' }, after: { 500: { actions: () => setProgress(30) } } },
      running: { on: { SUCCESS: 'success', ERROR: 'error' }, after: { 200: { actions: () => setProgress(70) } } },
      success: { type: 'final' },
      error: { on: { RETRY: 'locking' } },
    },
  });
  const [machineState, setMachineState] = useState('idle');
  const service = useMemo(() => interpret(runModelMachine).onTransition((state) => setMachineState(String(state.value))), []);
  useEffect(() => { service.start(); return () => service.stop(); }, [service]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const res = await fetch(API('/api/default_params/'));
        if (!res.ok) throw new Error('Failed to fetch defaults');
        const data = await res.json();
        setAssumptions(data);
        const btcRes = await fetch(API('/api/btc_price/'));
        if (!btcRes.ok) throw new Error('Failed to fetch BTC price');
        const btcData = await btcRes.json();
        setAssumptions((prev: any) => ({ ...prev, BTC_current_market_price: btcData.BTC_current_market_price, targetBTCPrice: btcData.BTC_current_market_price }));
      } catch (e: any) {
        setError(e.message);
      }
    };
    initialize();
  }, []);

  const handleCalculate = async () => {
    service.send('RUN');
    try {
      const res = await fetch(API('/api/lock_snapshot/'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, mode }) });
      if (!res.ok) throw new Error('Lock failed');
      const data = await res.json();
      setSnapshotId(data.snapshot_id);
      service.send('LOCKED');
      const calcRes = await fetch(API('/api/calculate/'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, format: 'json', use_live: true, snapshot_id: data.snapshot_id }) });
      if (!calcRes.ok) throw new Error('Calculation failed');
      const calcData = await calcRes.json();
      setResults(calcData);
      service.send('SUCCESS');
      setPage('decision');
    } catch (e: any) {
      service.send('ERROR');
      setError(e.message);
    } finally {
      setTimeout(() => setProgress(0), 500);
    }
  };

  const debouncedWhatIf = useMemo(() => debounce(async ({ param, value }: { param: string, value: number }) => {
    if (!snapshotId) return;
    try {
      const res = await fetch(API('/api/what_if/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ param, value, snapshot_id: snapshotId, format: 'json' })
      });
      if (!res.ok) throw new Error('What-If failed');
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, 500), [snapshotId]);

  const fetchAudit = async () => {
    try {
      const res = await fetch(API('/api/get_audit_trail/'));
      if (!res.ok) throw new Error('Audit fetch failed');
      const data = await res.json();
      setAuditTrail(data.audit_trail || []);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const res = await fetch(API('/api/calculate/'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, format, use_live: true, snapshot_id: snapshotId }) });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treasury.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const isLoading = ['locking', 'running'].includes(machineState);

  return (
    <div className="min-h-screen p-6 bg-slate-100 dark:bg-slate-900 font-ibm-plex-sans">
      <ToastContainer />
      <header className="mb-6 flex justify-between items-center">
        <h1 className="font-inter-tight text-[28px] font-semibold tracking-tight">Block Three Capital</h1>
        <Button onClick={() => setDark(!dark)} variant="ghost" className="ml-4">
          {dark ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </header>
      {page === 'landing' && <Landing setPage={setPage} />}
      {page === 'assumptions' && (
        <Assumptions
          assumptions={assumptions}
          setAssumptions={setAssumptions}
          mode={mode}
          setMode={setMode}
          ticker={ticker}
          setTicker={setTicker}
          handleUpload={() => {}}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          handleCalculate={handleCalculate}
          snapshotId={snapshotId}
          isLoading={isLoading}
          progress={progress}
          error={error}
        />
      )}
      {page === 'decision' && results && (
        <DecisionView
          results={results}
          assumptions={assumptions}
          setPage={setPage}
          debouncedWhatIf={debouncedWhatIf}
          isWhatIfOpen={false}
          setIsWhatIfOpen={() => {}}
          handleExport={handleExport}
          fetchAudit={fetchAudit}
          auditTrail={auditTrail}
        />
      )}
      {page === 'audit' && <AuditPanel auditTrail={auditTrail} setPage={setPage} />}
    </div>
  )
}