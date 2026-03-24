import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';

export default function AdminSecurityPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-security'],
    queryFn: async () => (await api.get('/admin/security')).data,
  });
  const unblockMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/security/${id}/unblock`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-security'] }),
  });
  const resetAbuseMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/security/${id}/reset-abuse`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-security'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Abuse Monitoring</h1>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load security data. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No abuse data found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Failures</th>
              <th className="p-2 text-left">Last Activity</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u: any) => {
              let color = 'bg-green-600';
              if (u.failures > 10) color = 'bg-yellow-400';
              if (u.failures > 25) color = 'bg-red-600';
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2"><span className={`px-2 py-1 rounded text-white text-xs ${color}`}>{u.failures}</span></td>
                  <td className="p-2">{u.last_activity ? new Date(u.last_activity).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white text-xs ${u.status === 'blocked' ? 'bg-red-600' : 'bg-green-600'}`}>{u.status}</span>
                  </td>
                  <td className="p-2 flex gap-2">
                    {u.status === 'blocked' && <Button onClick={() => unblockMutation.mutate(u.id)} disabled={unblockMutation.isPending}>Unblock</Button>}
                    <Button onClick={() => resetAbuseMutation.mutate(u.id)} disabled={resetAbuseMutation.isPending}>Reset Abuse</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
