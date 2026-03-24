import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import ContactsUpload from './ContactsUpload';
import Button from '../ui/button';

export default function ContactsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => (await api.get('/contacts')).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <ContactsUpload />
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Contacts List</h2>
        {isLoading && <div>Loading contacts...</div>}
        {isError && <div className="text-red-500">Failed to load contacts. <Button onClick={() => refetch()}>Retry</Button></div>}
        {!isLoading && !isError && (!data || data.length === 0) && <div>No contacts found.</div>}
        {!isLoading && !isError && data && data.length > 0 && (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
