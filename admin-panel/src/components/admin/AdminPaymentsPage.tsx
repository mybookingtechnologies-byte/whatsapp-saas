
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import Toast from '../ui/toast';
import { HiArrowPath, HiMagnifyingGlass, HiDocumentText } from 'react-icons/hi2';
import Input from '../ui/input';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-400', label: 'In Review' },
    approved: { color: 'bg-green-600', label: 'Approved' },
    rejected: { color: 'bg-red-600', label: 'Rejected' },
  };
  const s = map[status] || { color: 'bg-gray-400', label: status };
  return <span className={`px-2 py-1 rounded text-white text-xs ${s.color}`}>{s.label}</span>;
}

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle" />;
}

function InvoiceModal({ payment, open, onClose }: { payment: any, open: boolean, onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HiDocumentText className="w-6 h-6 text-blue-600" /> Invoice</h2>
        <div className="mb-2">Invoice ID: <span className="font-mono font-semibold">{payment.invoiceId}</span></div>
        <div className="mb-2">User: <span className="font-semibold">{payment.userEmail}</span></div>
        <div className="mb-2">Plan: <span className="font-semibold">{payment.plan}</span></div>
        <div className="mb-2">Amount: <span className="font-bold">₹{payment.amount}</span></div>
        <div className="mb-2">Date: {new Date(payment.date).toLocaleString()}</div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-payments', search, status, dateFrom, dateTo, page, limit],
    queryFn: async () => (await api.get('/admin/payments', { params: { search, status, dateFrom, dateTo, page, limit } })).data,
    // @ts-expect-error: keepPreviousData is valid in React Query v4+
    keepPreviousData: true,
    refetchInterval: 7000,
  });
  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/payments/${id}/approve`),
    onSuccess: () => { setToast({ message: 'Payment Approved', type: 'success' }); queryClient.invalidateQueries({ queryKey: ['admin-payments'] }); },
    onError: () => setToast({ message: 'Failed to approve', type: 'error' }),
  });
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/admin/payments/${id}/reject`),
    onSuccess: () => { setToast({ message: 'Payment Rejected', type: 'success' }); queryClient.invalidateQueries({ queryKey: ['admin-payments'] }); },
    onError: () => setToast({ message: 'Failed to reject', type: 'error' }),
  });
  const bulkApprove = useMutation({
    mutationFn: async (ids: string[]) => Promise.all(ids.map(id => api.post(`/admin/payments/${id}/approve`))),
    onSuccess: () => { setToast({ message: 'Payments Approved', type: 'success' }); setSelected([]); queryClient.invalidateQueries({ queryKey: ['admin-payments'] }); },
    onError: () => setToast({ message: 'Bulk approve failed', type: 'error' }),
  });
  const bulkReject = useMutation({
    mutationFn: async (ids: string[]) => Promise.all(ids.map(id => api.post(`/admin/payments/${id}/reject`))),
    onSuccess: () => { setToast({ message: 'Payments Rejected', type: 'success' }); setSelected([]); queryClient.invalidateQueries({ queryKey: ['admin-payments'] }); },
    onError: () => setToast({ message: 'Bulk reject failed', type: 'error' }),
  });

  const payments = useMemo(() => (data && Array.isArray((data as any).items) ? (data as any).items : []), [data]);
  const total = typeof (data as any)?.total === 'number' ? (data as any).total : 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-56">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><HiMagnifyingGlass className="w-5 h-5 text-gray-400" /></span>
            <Input
              type="text"
              placeholder="Search by email or Txn ID"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 w-full"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
            <option value="all">All Status</option>
            <option value="pending">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-36" />
          <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-36" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} className="flex items-center gap-1"><HiArrowPath className="w-5 h-5" /> Refresh</Button>
        </div>
      </div>
      {selected.length > 0 && (
        <div className="mb-4 flex gap-2">
          <Button onClick={() => bulkApprove.mutate(selected)} disabled={bulkApprove.isPending}><span className="mr-1">Approve Selected</span>{bulkApprove.isPending && <Spinner />}</Button>
          <Button onClick={() => bulkReject.mutate(selected)} disabled={bulkReject.isPending}><span className="mr-1">Reject Selected</span>{bulkReject.isPending && <Spinner />}</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded shadow bg-white">
        {isLoading || isFetching ? (
          <div className="space-y-2 p-4">{[...Array(8)].map((_,i) => <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />)}</div>
        ) : isError ? (
          <div className="text-red-500 p-4">Failed to load payments. <Button onClick={() => refetch()}>Retry</Button></div>
        ) : payments.length === 0 ? (
          <div className="p-4">No payments found.</div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2"><input type="checkbox" checked={selected.length === payments.length} onChange={e => setSelected(e.target.checked ? payments.map((p: any) => p.id) : [])} /></th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Transaction ID</th>
                <th className="p-2 text-left">Screenshot</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={e => { if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') setModal(p); }}>
                  <td className="p-2"><input type="checkbox" checked={selected.includes(p.id)} onChange={e => setSelected(e.target.checked ? [...selected, p.id] : selected.filter(id => id !== p.id))} onClick={e => e.stopPropagation()} /></td>
                  <td className="p-2">{p.userName} <span className="text-gray-500 text-xs">{p.userEmail}</span></td>
                  <td className="p-2">₹{p.amount}</td>
                  <td className="p-2 font-mono">{p.transactionId}</td>
                  <td className="p-2">
                    {p.screenshot && <a href={p.screenshot} target="_blank" rel="noopener noreferrer"><img src={p.screenshot} alt="screenshot" className="h-12 w-12 object-cover rounded" /></a>}
                  </td>
                  <td className="p-2"><StatusBadge status={p.status} /></td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    {p.status === 'approved' && p.invoiceUrl && <Button onClick={e => { e.stopPropagation(); setInvoice(p); }}>View Invoice</Button>}
                    {p.status === 'pending' && <>
                      <Button onClick={e => { e.stopPropagation(); approveMutation.mutate(p.id); }} disabled={approveMutation.isPending}><span className="mr-1">Approve</span>{approveMutation.isPending && <Spinner />}</Button>
                      <Button onClick={e => { e.stopPropagation(); rejectMutation.mutate(p.id); }} disabled={rejectMutation.isPending}><span className="mr-1">Reject</span>{rejectMutation.isPending && <Spinner />}</Button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <span className="text-sm">Page {page} of {pageCount}</span>
          <Button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
        </div>
      )}
      {/* Invoice modal */}
      {invoice && (
        <InvoiceModal payment={invoice} open={!!invoice} onClose={() => setInvoice(null)} />
      )}
      {/* Invoice modal */}
      {invoice && (
          <InvoiceModal payment={invoice} open={!!invoice} onClose={() => setInvoice(null)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
