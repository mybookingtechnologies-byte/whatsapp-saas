import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/api';
import { useState } from 'react';
import Button from '../ui/button';
import Toast from '../ui/toast';

function QRCode({ value }: { value: string }) {
  // Use a public QR API for simplicity
  return <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`} alt="UPI QR" className="mx-auto" />;
}

export default function UpiPaymentPage({ plan }: { plan: { name: string; amount: number } }) {
  const { data: upi, isLoading, isError, refetch } = useQuery({
    queryKey: ['upi-config'],
    queryFn: async () => (await api.get('/payments/upi-config')).data,
  });
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [toast, setToast] = useState<any>(null);
  const [status, setStatus] = useState<'idle'|'review'|'success'|'failed'>('idle');
  const mutation = useMutation({
    mutationFn: async (form: FormData) => api.post('/payments/upi', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => setStatus('review'),
    onError: (err: any) => setToast({ message: err?.response?.data?.message || 'Payment failed', type: 'error' }),
  });

  if (isLoading) return <div className="h-40 bg-gray-200 animate-pulse rounded" />;
  if (isError) return <div className="text-red-500">Failed to load UPI config. <Button onClick={() => refetch()}>Retry</Button></div>;
  if (!upi) return <div>No UPI config found.</div>;

  const upiUrl = `upi://pay?pa=${upi.upiId}&pn=${upi.appName}&am=${plan.amount}&cu=INR`;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!transactionId || !screenshot) {
      setToast({ message: 'All fields required', type: 'error' });
      return;
    }
    const form = new FormData();
    form.append('plan', plan.name);
    form.append('amount', String(plan.amount));
    form.append('transactionId', transactionId);
    form.append('screenshot', screenshot);
    mutation.mutate(form);
  };

  if (status === 'review') return <div className="bg-white rounded shadow p-6 max-w-md mx-auto text-center">Payment in Review</div>;
  if (status === 'success') return <div className="bg-green-100 rounded shadow p-6 max-w-md mx-auto text-center">Payment Successful</div>;
  if (status === 'failed') return <div className="bg-red-100 rounded shadow p-6 max-w-md mx-auto text-center">Payment Failed</div>;

  return (
    <div className="bg-white rounded shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Pay via UPI</h2>
      <div className="mb-4">
        <div className="font-semibold">Plan: {plan.name}</div>
        <div>Amount: <span className="font-bold">₹{plan.amount}</span></div>
      </div>
      <QRCode value={upiUrl} />
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono">{upi.upiId}</span>
        <Button type="button" onClick={() => {navigator.clipboard.writeText(upi.upiId); setToast({ message: 'Copied!', type: 'success' });}}>Copy</Button>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block mb-1">Transaction ID</label>
          <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Upload Screenshot</label>
          <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} className="border rounded px-3 py-2 w-full" required />
        </div>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Submitting...' : 'Submit Payment'}</Button>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
