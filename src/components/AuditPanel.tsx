import React, { useEffect, useMemo, useState } from 'react';
import { Card, SectionTitle, Button, Pill, Stat } from './Primitives';
import { API } from '../utils';

interface AuditChange {
  field?: string;
  from?: any;
  to?: any;
}

interface AuditEntry {
  timestamp?: string;
  user?: string;
  snapshot_id?: string;
  mode?: 'public' | 'private' | 'pro-forma' | string;
  action?: string;
  code_hash?: string;
  seed?: number;
  assumptions?: Record<string, any>;
  changes?: AuditChange[] | Record<string, any>;
}

interface Props {
  auditTrail: AuditEntry[];
  setPage: (page: string) => void;
  token: string | null;
}

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function JsonPreview({ value }: { value: any }) {
  const pretty = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);
  return (
    <pre className="text-xs sm:text-sm whitespace-pre-wrap bg-slate-50 dark:bg-zinc-900/60 p-2 sm:p-3 rounded border border-slate-200 dark:border-zinc-700 overflow-auto max-h-48 sm:max-h-64">
      {pretty}
    </pre>
  );
}

export default function AuditPanel({ auditTrail: auditTrailProp, setPage, token }: Props) {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(auditTrailProp || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchAudit = async () => {
    if (!token) {
      setPage('login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API('/api/get_audit_trail/'), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setPage('login');
          return;
        }
        throw new Error('Failed to fetch audit trail');
      }
      const data = await res.json();
      setAuditTrail(Array.isArray(data?.audit_trail) ? data.audit_trail : []);
      setCurrentPage(1); // Reset to first page when refreshing
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auditTrailProp || auditTrailProp.length === 0) {
      fetchAudit();
    }
  }, [auditTrailProp, token, setPage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (auditTrail || []).filter((e) => {
      if (modeFilter !== 'all' && e.mode !== modeFilter) return false;
      if (!q) return true;
      const hay = [e.snapshot_id, e.action, e.user, e.code_hash]
        .concat(Object.keys((e.assumptions || {})))
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [auditTrail, query, modeFilter]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const bySnapshot = useMemo(() => {
    const m = new Map<string, AuditEntry[]>();
    for (const e of paginatedItems) {
      const key = e.snapshot_id || '—';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return m;
  }, [paginatedItems]);

  const snapshotKeys = Array.from(bySnapshot.keys());

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} entries
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-2 py-1 text-xs sm:text-sm rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          variant="ghost"
          className="px-3 py-1 text-xs sm:text-sm"
        >
          First
        </Button>
        <Button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="ghost"
          className="px-3 py-1 text-xs sm:text-sm"
        >
          Previous
        </Button>
        
        <span className="mx-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <Button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="ghost"
          className="px-3 py-1 text-xs sm:text-sm"
        >
          Next
        </Button>
        <Button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          variant="ghost"
          className="px-3 py-1 text-xs sm:text-sm"
        >
          Last
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <SectionTitle
        right={
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user / action / field"
              className="px-3 py-2 text-xs sm:text-sm rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full sm:w-auto"
            />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-full sm:w-auto"
            >
              <option value="all">All modes</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="pro-forma">Pro-forma</option>
            </select>
            <Button onClick={fetchAudit} variant="ghost" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button onClick={() => setPage('decision')} variant="ghost" className="w-full sm:w-auto">
              Back
            </Button>
          </div>
        }
      >
        Audit Trail
      </SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Entries" value={String(totalItems)} />
        <Stat label="Snapshots" value={String(snapshotKeys.length)} />
        <Stat label="Mode" value={modeFilter === 'all' ? 'Any' : modeFilter} />
        <Stat label="Errors" value={error ? '1' : '0'} tone={error ? 'warn' : 'good'} />
      </div>

      {error && (
        <Card className="border-red-300 dark:border-red-700">
          <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>
        </Card>
      )}

      {snapshotKeys.length === 0 && (
        <Card>
          <p className="text-center text-xs sm:text-sm text-gray-500">No audit entries</p>
        </Card>
      )}

      {snapshotKeys.map((sid) => {
        const entries = bySnapshot.get(sid) || [];
        const head = entries[0] || {};
        const last = entries[entries.length - 1] || {};
        return (
          <Card key={sid} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-inter-tight text-base sm:text-lg">Snapshot {sid || '—'}</h3>
                <p className="text-xs sm:text-sm text-gray-500">First: {formatDate(head.timestamp)} · Last: {formatDate(last.timestamp)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Pill tone={head.mode === 'public' ? 'green' : head.mode === 'pro-forma' ? 'amber' : 'gray'}>
                  {head.mode || 'mode?'}
                </Pill>
                {head.code_hash && (
                  <Pill tone="gray">code: {String(head.code_hash).slice(0, 8)}</Pill>
                )}
                {typeof head.seed === 'number' && (
                  <Pill tone="gray">seed: {head.seed}</Pill>
                )}
              </div>
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-zinc-900 rounded-lg">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-800">
                    <th className="p-2 text-left text-xs sm:text-sm">Timestamp</th>
                    <th className="p-2 text-left text-xs sm:text-sm">Action</th>
                    <th className="p-2 text-left text-xs sm:text-sm">User</th>
                    <th className="p-2 text-left text-xs sm:text-sm">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-zinc-700 align-top">
                      <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{formatDate(e.timestamp)}</td>
                      <td className="p-2 text-xs sm:text-sm">{e.action || '—'}</td>
                      <td className="p-2 text-xs sm:text-sm">{e.user || '—'}</td>
                      <td className="p-2 text-xs sm:text-sm">
                        {Array.isArray(e.changes) ? (
                          <details>
                            <summary className="cursor-pointer">{e.changes.length} field(s) changed</summary>
                            <div className="mt-2 space-y-2">
                              {(e.changes as AuditChange[]).map((c, j) => (
                                <Card key={j} className="p-2">
                                  <div className="text-xs sm:text-sm font-medium">{c.field || 'field'}</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                    <div>
                                      <div className="text-[10px] sm:text-[11px] text-gray-500">from</div>
                                      <JsonPreview value={c.from} />
                                    </div>
                                    <div>
                                      <div className="text-[10px] sm:text-[11px] text-gray-500">to</div>
                                      <JsonPreview value={c.to} />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </details>
                        ) : e.changes ? (
                          <details>
                            <summary className="cursor-pointer">view JSON</summary>
                            <div className="mt-2"><JsonPreview value={e.changes} /></div>
                          </details>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card Layout */}
            <div className="block sm:hidden space-y-4">
              {entries.map((e, i) => (
                <Card key={i} className="p-3">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-xs">Timestamp:</span>{' '}
                      <span className="text-xs">{formatDate(e.timestamp)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-xs">Action:</span>{' '}
                      <span className="text-xs">{e.action || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-xs">User:</span>{' '}
                      <span className="text-xs">{e.user || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-xs">Changes:</span>
                      {Array.isArray(e.changes) ? (
                        <details>
                          <summary className="cursor-pointer text-xs">{e.changes.length} field(s) changed</summary>
                          <div className="mt-2 space-y-2">
                            {(e.changes as AuditChange[]).map((c, j) => (
                              <Card key={j} className="p-2">
                                <div className="text-xs font-medium">{c.field || 'field'}</div>
                                <div className="grid grid-cols-1 gap-2 mt-1">
                                  <div>
                                    <div className="text-[10px] text-gray-500">from</div>
                                    <JsonPreview value={c.from} />
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-gray-500">to</div>
                                    <JsonPreview value={c.to} />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </details>
                      ) : e.changes ? (
                        <details>
                          <summary className="cursor-pointer text-xs">view JSON</summary>
                          <div className="mt-2"><JsonPreview value={e.changes} /></div>
                        </details>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {head.assumptions && (
              <div>
                <h4 className="font-inter-tight text-sm sm:text-base mb-1">Assumptions (at lock)</h4>
                <JsonPreview value={head.assumptions} />
              </div>
            )}
          </Card>
        );
      })}

      {/* Pagination Controls */}
      {totalItems > 5 && <PaginationControls />}

      <div className="flex justify-end gap-2">
        <Button onClick={() => setPage('decision')} variant="primary" className="w-full sm:w-auto">
          Back to Decision
        </Button>
      </div>
    </div>
  );
}