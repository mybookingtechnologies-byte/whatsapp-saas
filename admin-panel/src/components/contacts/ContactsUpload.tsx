import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import Toast from '../ui/toast';

export default function ContactsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('/contacts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setToast({ message: 'Contacts uploaded!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setFile(null);
    },
    onError: (err: any) => {
      setToast({ message: err?.response?.data?.message || 'Failed to upload contacts', type: 'error' });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow max-w-lg mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">Upload Contacts (CSV)</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} required className="block" />
      <Button type="submit" disabled={mutation.isPending || !file}>
        {mutation.isPending ? 'Uploading...' : 'Upload'}
      </Button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </form>
  );
}
