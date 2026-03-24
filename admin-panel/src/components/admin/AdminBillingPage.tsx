import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import { useState } from 'react';

export default function AdminBillingPage() {
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-billing', status, date],
    queryFn: async () => (await api.get('/admin/billing', { params: { status, date } })).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing & Transactions</h1>
      <div className="flex gap-4 mb-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-3 py-2" />
        <Button onClick={() => refetch()}>Filter</Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load transactions. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Payment ID</th>
              <th className="p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.user}</td>
                <td className="p-2">₹{t.amount}</td>
                <td className="p-2"><span className={`px-2 py-1 rounded text-white text-xs ${t.status === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{t.status}</span></td>
                <td className="p-2">{t.paymentId}</td>
                <td className="p-2">{new Date(t.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
