import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
  });

  const blockMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/users/${id}/block`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
  const unblockMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/users/${id}/unblock`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
  const resetCreditsMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/users/${id}/reset-credits`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
  // ...change plan mutation can be added similarly

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Failed to load users. <button onClick={() => refetch()}>Retry</button></div>;
  if (!data) return <div>No users found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <table className="w-full border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Plan</th>
            <th className="p-2 text-left">Credits</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.plan}</td>
              <td className="p-2">{u.credits}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-white text-xs ${u.status === 'blocked' ? 'bg-red-600' : 'bg-green-600'}`}>{u.status}</span>
              </td>
              <td className="p-2 flex gap-2">
                {u.status === 'active' ? (
                  <Button onClick={() => blockMutation.mutate(u.id)} disabled={blockMutation.isPending}>Block</Button>
                ) : (
                  <Button onClick={() => unblockMutation.mutate(u.id)} disabled={unblockMutation.isPending}>Unblock</Button>
                )}
                <Button onClick={() => resetCreditsMutation.mutate(u.id)} disabled={resetCreditsMutation.isPending}>Reset Credits</Button>
                {/* Change plan button can be added here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
