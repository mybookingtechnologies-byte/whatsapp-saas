import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export default function BillingHistory() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-history'],
    queryFn: async () => (await api.get('/billing/history')).data,
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Billing History</h2>
      {isLoading && <div>Loading billing history...</div>}
      {isError && <div className="text-red-500">Failed to load billing history. <button onClick={() => refetch()}>Retry</button></div>}
      {!isLoading && !isError && (!data || data.length === 0) && <div>No billing history found.</div>}
      {!isLoading && !isError && data && data.length > 0 && (
        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="p-2">{b.date}</td>
                <td className="p-2">{b.plan}</td>
                <td className="p-2">₹{b.amount}</td>
                <td className="p-2">{b.status}</td>
                <td className="p-2">
                  {b.invoice_url ? (
                    <a href={b.invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
