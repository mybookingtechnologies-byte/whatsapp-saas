import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { useParams } from 'next/navigation';
import Button from '../ui/button';
import { useState } from 'react';

function TenantModal({ open, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Create Tenant</h2>
        <div className="mb-2">
          <label className="block mb-1">Tenant Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Domain</label>
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Plan</label>
          <input type="text" value={plan} onChange={e => setPlan(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose} className="bg-gray-300 text-black">Cancel</Button>
          <Button onClick={() => onSave({ name, domain, plan })} className="bg-blue-600">Create</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminResellerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reseller', id],
    queryFn: async () => (await api.get(`/admin/resellers/${id}`)).data,
    enabled: !!id,
  });
  const [showModal, setShowModal] = useState(false);
  const createTenantMutation = useMutation({
    mutationFn: async (tenant: any) => api.post(`/admin/resellers/${id}/tenants`, tenant),
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-reseller', id] });
    },
  });
  const changePlanMutation = useMutation({
    mutationFn: async ({ tenantId, plan }: any) => api.post(`/admin/tenants/${tenantId}/change-plan`, { plan }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reseller', id] }),
  });
  const toggleTenantMutation = useMutation({
    mutationFn: async ({ tenantId, status }: any) => api.post(`/admin/tenants/${tenantId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reseller', id] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reseller Details</h1>
      <Button onClick={() => setShowModal(true)} className="mb-4">Create Tenant</Button>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load tenants. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || !data.tenants || data.tenants.length === 0 ? (
        <div>No tenants found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Tenant Name</th>
              <th className="p-2 text-left">Domain</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.tenants.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.domain}</td>
                <td className="p-2">{t.plan}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white text-xs ${t.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}>{t.status}</span>
                </td>
                <td className="p-2 flex gap-2">
                  <Button onClick={() => changePlanMutation.mutate({ tenantId: t.id, plan: 'new-plan' })}>Change Plan</Button>
                  <Button onClick={() => toggleTenantMutation.mutate({ tenantId: t.id, status: t.status === 'active' ? 'inactive' : 'active' })}>
                    {t.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <TenantModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={tenant => createTenantMutation.mutate(tenant)}
        />
      )}
    </div>
  );
}
