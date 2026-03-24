import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import { useState } from 'react';

const levelColors: Record<string, string> = {
  error: 'bg-red-600',
  warn: 'bg-yellow-400',
  info: 'bg-green-600',
};

export default function AdminLogsPage() {
  const [level, setLevel] = useState('all');
  const [date, setDate] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-logs', level, date],
    queryFn: async () => (await api.get('/admin/logs', { params: { level, date } })).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Logs</h1>
      <div className="flex gap-4 mb-4">
        <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-3 py-2">
          <option value="all">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-3 py-2" />
        <Button onClick={() => refetch()}>Filter</Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load logs. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No logs found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Timestamp</th>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log: any) => (
              <tr key={log.id} className="border-t">
                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2"><span className={`px-2 py-1 rounded text-white text-xs ${levelColors[log.level] || 'bg-gray-400'}`}>{log.level}</span></td>
                <td className="p-2">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
