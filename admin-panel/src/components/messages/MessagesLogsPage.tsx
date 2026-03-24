
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';

export default function MessagesLogsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => (await api.get('/messages')).data,
    refetchInterval: 5000, // 5s polling for live updates
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Message Logs</h1>
      {isLoading || isFetching ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-10 bg-gray-200 rounded w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-red-500">Failed to load messages. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No messages found.</div>
      ) : (
        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Error</th>
              <th className="p-2 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m: any) => {
              let badge = '';
              let badgeColor = '';
              switch (m.status) {
                case 'pending': badge = 'Pending'; badgeColor = 'bg-gray-400'; break;
                case 'sent': badge = 'Sent'; badgeColor = 'bg-green-600'; break;
                case 'failed': badge = 'Failed'; badgeColor = 'bg-red-600'; break;
                default: badge = m.status; badgeColor = 'bg-gray-400';
              }
              return (
                <tr key={m.id} className="border-t">
                  <td className="p-2">{m.phone}</td>
                  <td className="p-2"><span className={`px-2 py-1 rounded text-white text-xs ${badgeColor}`}>{badge}</span></td>
                  <td className="p-2">{m.error || '-'}</td>
                  <td className="p-2">{m.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
