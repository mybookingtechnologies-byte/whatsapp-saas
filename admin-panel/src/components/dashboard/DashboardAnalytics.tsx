import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export default function DashboardAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => (await api.get('/analytics/summary')).data,
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (isError) return <div className="text-red-500">Failed to load analytics. <button onClick={() => refetch()}>Retry</button></div>;
  if (!data) return <div>No analytics data.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div className="bg-white rounded shadow p-6">
        <div className="text-2xl font-bold">{data.total_messages}</div>
        <div className="text-gray-500">Total Messages</div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <div className="text-2xl font-bold">{data.success_rate}%</div>
        <div className="text-gray-500">Success Rate</div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <div className="text-2xl font-bold">{data.failed_count}</div>
        <div className="text-gray-500">Failed</div>
      </div>
    </div>
  );
}
