import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import { useState } from 'react';

function EditPlanModal({ plan, open, onClose, onSave }: any) {
  const [price, setPrice] = useState(plan.price);
  const [limit, setLimit] = useState(plan.message_limit);
  const [status, setStatus] = useState(plan.status);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Edit Plan</h2>
        <div className="mb-2">
          <label className="block mb-1">Price (₹)</label>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Message Limit</label>
          <input type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2 w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose} className="bg-gray-300 text-black">Cancel</Button>
          <Button onClick={() => onSave({ ...plan, price, message_limit: limit, status })} className="bg-blue-600">Save</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => (await api.get('/admin/plans')).data,
  });
  const [editPlan, setEditPlan] = useState<any>(null);
  const updatePlanMutation = useMutation({
    mutationFn: async (plan: any) => api.post(`/admin/plans/${plan.id}/update`, plan),
    onSuccess: () => {
      setEditPlan(null);
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plan Management</h1>
      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />)}</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load plans. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : !data || data.length === 0 ? (
        <div>No plans found.</div>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Message Limit</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((plan: any) => (
              <tr key={plan.id} className="border-t">
                <td className="p-2">{plan.name}</td>
                <td className="p-2">₹{plan.price}</td>
                <td className="p-2">{plan.message_limit}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white text-xs ${plan.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}>{plan.status}</span>
                </td>
                <td className="p-2">
                  <Button onClick={() => setEditPlan(plan)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          open={!!editPlan}
          onClose={() => setEditPlan(null)}
          onSave={plan => updatePlanMutation.mutate(plan)}
        />
      )}
    </div>
  );
}
