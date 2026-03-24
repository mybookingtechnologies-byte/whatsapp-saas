import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import Button from '../ui/button';
import CampaignDetailsSkeleton from './CampaignDetailsSkeleton';

export default function CampaignDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => (await api.get(`/campaigns/${id}`)).data,
    refetchInterval: 5000,
    enabled: !!id,
  });

  if (isLoading || isFetching) return <CampaignDetailsSkeleton />;
  if (isError) return <div className="text-red-500">Failed to load campaign. <Button onClick={() => refetch()}>Retry</Button></div>;
  if (!data) return <div>No campaign found.</div>;

  const percent = data.total > 0 ? Math.round((data.sent / data.total) * 100) : 0;
  let badge = '', badgeColor = '';
  switch (data.status) {
    case 'pending': badge = 'Pending'; badgeColor = 'bg-gray-400'; break;
    case 'scheduled': badge = 'Scheduled'; badgeColor = 'bg-yellow-400'; break;
    case 'running': badge = 'Running'; badgeColor = 'bg-blue-500'; break;
    case 'completed': badge = 'Completed'; badgeColor = 'bg-green-600'; break;
    case 'failed': badge = 'Failed'; badgeColor = 'bg-red-600'; break;
    default: badge = data.status; badgeColor = 'bg-gray-400';
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <span className={`px-2 py-1 rounded text-white text-xs ${badgeColor}`}>{badge}</span>
      </div>
      <div className="mb-2">Total Messages: <span className="font-semibold">{data.total}</span></div>
      <div className="mb-2">Sent: <span className="text-green-600 font-semibold">{data.sent}</span></div>
      <div className="mb-2">Failed: <span className="text-red-600 font-semibold">{data.failed}</span></div>
      <div className="mb-6">Scheduled: {data.schedule_time ? new Date(data.schedule_time).toLocaleString() : '-'}</div>
      <div className="mb-2 flex items-center gap-2">
        <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-4 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-12 text-right text-sm font-semibold">{percent}%</span>
      </div>
    </div>
  );
}
