import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/api';
import { useState } from 'react';
import Button from '../ui/button';
import Toast from '../ui/toast';

export default function UpiSettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['upi-config'],
    queryFn: async () => (await api.get('/admin/upi-config')).data,
  });
  const [upiId, setUpiId] = useState('');
  const [toast, setToast] = useState<any>(null);
  const mutation = useMutation({
    mutationFn: async (upiId: string) => api.post('/admin/upi-config', { upiId }),
    onSuccess: () => { setToast({ message: 'UPI ID saved', type: 'success' }); refetch(); },
    onError: (err: any) => setToast({ message: err?.response?.data?.message || 'Failed to save', type: 'error' }),
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-6">UPI Settings</h1>
      {isLoading ? (
        <div className="h-10 bg-gray-200 animate-pulse rounded mb-4" />
      ) : isError ? (
        <div className="text-red-500 mb-4">Failed to load UPI config. <Button onClick={() => refetch()}>Retry</Button></div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(upiId); }} className="space-y-4">
          <div>
            <label className="block mb-1">UPI ID</label>
            <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="border rounded px-3 py-2 w-full" required />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
        </form>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
