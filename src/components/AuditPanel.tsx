
import React from 'react'
import { Card, SectionTitle, Button } from './Primitives'

export default function AuditPanel({ auditTrail, setPage }: any) {
  return (
    <div className="space-y-6">
      <SectionTitle>Audit Trail</SectionTitle>
      <Card>
        <table className="w-full border-collapse">
          <thead><tr><th className="p-2 text-[14px]">Timestamp</th><th className="p-2 text-[14px]">Changes</th></tr></thead>
          <tbody>
            {auditTrail.map((entry: any, i: number) => (
              <tr key={i} className="border-b border-gray-200 dark:border-zinc-700">
                <td className="p-2 text-[14px]">{entry.timestamp}</td>
                <td className="p-2 text-[14px]">{JSON.stringify(entry.changes)}</td>
              </tr>
            ))}
            {auditTrail.length === 0 && <tr><td colSpan={2} className="p-2 text-center text-gray-500">No audit entries</td></tr>}
          </tbody>
        </table>
      </Card>
      <Button onClick={() => setPage('decision')} variant="ghost">Back</Button>
    </div>
  )
}
