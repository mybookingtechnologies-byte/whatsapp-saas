import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/summary')).data,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Failed to load dashboard. <button onClick={() => refetch()}>Retry</button></div>;
  if (!data) return <div>No data found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6">
          <div className="text-gray-500">Total Users</div>
          <div className="text-3xl font-bold">{data.total_users}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-gray-500">Active Users</div>
          <div className="text-3xl font-bold">{data.active_users}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-gray-500">Total Campaigns</div>
          <div className="text-3xl font-bold">{data.total_campaigns}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="text-gray-500">Messages Sent Today</div>
          <div className="text-3xl font-bold">{data.messages_today}</div>
        </div>
        <div className="bg-white rounded shadow p-6 col-span-1 md:col-span-2">
          <div className="text-gray-500">Revenue Summary</div>
          <div className="text-3xl font-bold">₹{data.revenue_summary}</div>
        </div>
      </div>
    </div>
  );
}
