import React, { useEffect, useMemo, useState } from 'react';
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import Landing from './pages/Landing';
import Assumptions from './pages/Assumptions';
import DecisionView from './components/DecisionView';
import AuditPanel from './components/AuditPanel';
import { Button } from './components/Primitives';
import { API } from './utils';

// Define the machine's context type
interface MachineContext {
  progress: number;
}

// Define the machine's event types
type MachineEvent =
  | { type: 'RUN' }
  | { type: 'LOCKED' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR' }
  | { type: 'RETRY' };

// Define state machine outside the component with proper typing
const runModelMachine = createMachine({
  id: 'runModel',
  initial: 'idle',
  context: { progress: 0 } as MachineContext,
  types: {} as {
    context: MachineContext;
    events: MachineEvent;
  },
  states: {
    idle: {
      on: { RUN: 'locking' },
    },
    locking: {
      on: {
        LOCKED: 'running',
        ERROR: 'error',
      },
      after: {
        500: {
          actions: assign({
            progress: () => 30,
          }),
        },
      },
    },
    running: {
      on: {
        SUCCESS: 'success',
        ERROR: 'error',
      },
      after: {
        200: {
          actions: assign({
            progress: () => 70,
          }),
        },
      },
    },
    success: { type: 'final' },
    error: {
      on: { RETRY: 'locking' },
    },
  },
});

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
  const [isExporting, setIsExporting] = useState(false);
  const [isTickerLoading, setIsTickerLoading] = useState(false);

  // Initialize state machine
  const [state, send] = useMachine(runModelMachine);

  // Sync machine's progress with React state
  useEffect(() => {
    setProgress(state.context.progress);
  }, [state.context.progress]);

  // Handle dark mode class on html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  // Initialize assumptions and BTC price
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
        setAssumptions((prev: any) => ({
          ...prev,
          BTC_current_market_price: btcData.BTC_current_market_price,
          targetBTCPrice: btcData.BTC_current_market_price,
        }));
      } catch (e: any) {
        setError(e.message);
      }
    };
    initialize();
  }, []);

  const handleTickerSubmit = async (ticker: string) => {
    if (!ticker) return;
    setIsTickerLoading(true);
    setError(null);
    const toastId = toast.loading(`Fetching SEC data for ${ticker}...`);
    try {
      const res = await fetch(API('/api/fetch_sec_data/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      if (!res.ok) throw new Error(`Failed to fetch SEC data for ${ticker}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAssumptions((prev: any) => ({
        ...prev,
        ...data,
      }));
      toast.update(toastId, {
        render: `Successfully fetched SEC data for ${ticker}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e: any) {
      setError(e.message);
      toast.update(toastId, {
        render: `Error: ${e.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsTickerLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
      e.target.value = '';
      return;
    }
    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (ticker) formData.append('ticker', ticker);
    const toastId = toast.loading(`Uploading ${selectedFile.name}...`);
    try {
      const res = await fetch(API('/api/upload_sec_data/'), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAssumptions((prev: any) => ({
        ...prev,
        ...data,
      }));
      toast.update(toastId, {
        render: `Successfully uploaded and parsed ${selectedFile.name}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      e.target.value = '';
      setFile(null);
    } catch (err: any) {
      toast.update(toastId, {
        render: `Error: ${err.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleCalculate = async () => {
    setProgress(10); // Start progress immediately
    send({ type: 'RUN' });
    try {
      const res = await fetch(API('/api/lock_snapshot/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assumptions, mode }),
      });
      if (!res.ok) throw new Error('Lock failed');
      const data = await res.json();
      setSnapshotId(data.snapshot_id);
      setProgress(50);
      send({ type: 'LOCKED' });
      const calcRes = await fetch(API('/api/calculate/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assumptions, format: 'json', use_live: true, snapshot_id: data.snapshot_id }),
      });
      if (!calcRes.ok) throw new Error('Calculation failed');
      const calcData = await calcRes.json();
      setResults(calcData);
      setProgress(100);
      send({ type: 'SUCCESS' });
      setPage('decision');
    } catch (e: any) {
      send({ type: 'ERROR' });
      setError(e.message);
      setProgress(0);
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const debouncedWhatIf = useMemo(
    () =>
      debounce(async ({ param, value }: { param: string; value: number }) => {
        if (!snapshotId) return;
        try {
          const res = await fetch(API('/api/what_if/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ param, value, snapshot_id: snapshotId, format: 'json' }),
          });
          if (!res.ok) throw new Error('What-If failed');
          const data = await res.json();
          setResults(data);
        } catch (e: any) {
          setError(e.message);
        }
      }, 500),
    [snapshotId]
  );

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
    if (isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading('Downloading PDF...');
    try {
      const res = await fetch(API('/api/calculate/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assumptions, format, use_live: true, snapshot_id: snapshotId }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treasury.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.update(toastId, {
        render: 'PDF downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e: any) {
      toast.update(toastId, {
        render: e.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = progress > 0 && progress < 100;

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
          handleUpload={handleUpload}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          handleCalculate={handleCalculate}
          snapshotId={snapshotId}
          isLoading={isLoading}
          progress={progress}
          error={error}
          handleTickerSubmit={handleTickerSubmit}
        />
      )}
      {page === 'decision' && results && (
        <DecisionView
          results={results}
          assumptions={assumptions}
          setPage={setPage}
          debouncedWhatIf={debouncedWhatIf}
          isWhatIfOpen={isWhatIfOpen}
          setIsWhatIfOpen={setIsWhatIfOpen}
          handleExport={handleExport}
          fetchAudit={fetchAudit}
          auditTrail={auditTrail}
          isExporting={isExporting}
          snapshotId={snapshotId}
        />
      )}
      {page === 'audit' && <AuditPanel auditTrail={auditTrail} setPage={setPage} />}
    </div>
  );
}