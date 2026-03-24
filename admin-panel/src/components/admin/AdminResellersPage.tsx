import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import Link from 'next/link';
import Button from '../ui/button';

export default function AdminResellersPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-resellers'],
    queryFn: async () => (await api.get('/admin/resellers')).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reseller Management</h1>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load resellers. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No resellers found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Tenants</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.tenantCount}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white text-xs ${r.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}>{r.status}</span>
                </td>
                <td className="p-2">
                  <Link href={`/admin/resellers/${r.id}`}> <Button>View</Button> </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
