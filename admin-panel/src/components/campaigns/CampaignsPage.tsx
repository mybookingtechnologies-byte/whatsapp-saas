
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import CampaignForm from './CampaignForm';
import Button from '../ui/button';
import Toast from '../ui/toast';


  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/campaigns')).data,
    refetchInterval: 5000, // 5s polling for live updates
  });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Automation Rule UI
  const [autoMinutes, setAutoMinutes] = useState('');
  const [autoMessage, setAutoMessage] = useState('');
  const [autoToast, setAutoToast] = useState<string | null>(null);
  const handleAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/automation', { minutes: Number(autoMinutes), message: autoMessage });
      setAutoToast('Automation rule created!');
      setAutoMinutes(''); setAutoMessage('');
    } catch (err: any) {
      setAutoToast(err?.response?.data?.message || 'Failed to create automation');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <CampaignForm />
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Campaign List</h2>
        {isLoading || isFetching ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-200 rounded w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load campaigns. <Button onClick={() => refetch()}>Retry</Button></div>
        ) : !data || data.length === 0 ? (
          <div>No campaigns found.</div>
        ) : (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Scheduled</th>
                <th className="p-2 text-left">Time Left</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Sent</th>
                <th className="p-2 text-left">Failed</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any) => {
                let badge = '';
                let badgeColor = '';
                switch (c.status) {
                  case 'pending': badge = 'Pending'; badgeColor = 'bg-gray-400'; break;
                  case 'scheduled': badge = 'Scheduled'; badgeColor = 'bg-yellow-400'; break;
                  case 'running': badge = 'Running'; badgeColor = 'bg-blue-500'; break;
                  case 'completed': badge = 'Completed'; badgeColor = 'bg-green-600'; break;
                  case 'failed': badge = 'Failed'; badgeColor = 'bg-red-600'; break;
                  default: badge = c.status; badgeColor = 'bg-gray-400';
                }
                let timeLeft = '';
                if (c.schedule_time && c.status === 'scheduled') {
                  const diff = Math.max(0, Math.floor((new Date(c.schedule_time).getTime() - now) / 1000));
                  if (diff > 0) {
                    const min = Math.floor(diff / 60);
                    const sec = diff % 60;
                    timeLeft = `${min}m ${sec}s`;
                  } else {
                    timeLeft = 'Starting...';
                  }
                }
                return (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded text-white text-xs ${badgeColor}`}>{badge}</span></td>
                    <td className="p-2">{c.schedule_time ? new Date(c.schedule_time).toLocaleString() : '-'}</td>
                    <td className="p-2">{timeLeft}</td>
                    <td className="p-2">{c.total}</td>
                    <td className="p-2">{c.sent}</td>
                    <td className="p-2">{c.failed}</td>
                    <td className="p-2">
                      <Button onClick={() => setToast({ message: 'View Details coming soon', type: 'success' })}>View Details</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Automation Rules</h2>
        <form onSubmit={handleAutomation} className="flex flex-col md:flex-row gap-2 items-center">
          <input
            type="number"
            min="1"
            placeholder="Minutes after event"
            value={autoMinutes}
            onChange={e => setAutoMinutes(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Automation message"
            value={autoMessage}
            onChange={e => setAutoMessage(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <Button type="submit">Create Automation</Button>
        </form>
        {autoToast && <div className="text-green-600 mt-2">{autoToast}</div>}
      </div>
    </div>
  );
}
