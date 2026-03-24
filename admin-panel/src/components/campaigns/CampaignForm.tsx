

import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Button from '../ui/button';
import Input from '../ui/input';
import Toast from '../ui/toast';



export default function CampaignForm() {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: billing } = useQuery({
    queryKey: ['billing-info'],
    queryFn: async () => (await api.get('/billing/info')).data,
  });

  type CampaignPayload = {
    name: string;
    template_id: string;
    message: string;
    phone_numbers: string[];
    schedule_time: string | null;
  };

  const mutation = useMutation({
    mutationFn: async (data: CampaignPayload) => {
      return api.post('/campaigns', data);
    },
    onSuccess: () => {
      setToast({ message: 'Campaign created!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setName(''); setTemplateId(''); setMessage(''); setPhoneNumbers(''); setScheduleTime('');
    },
    onError: (err: any) => {
      setToast({ message: err?.response?.data?.message || 'Failed to create campaign', type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = phoneNumbers.split(',').map((p: string) => p.trim()).filter(Boolean);
    if (billing && billing.remaining_credits < numbers.length) {
      setToast({ message: 'Message limit exceeded. Please upgrade your plan.', type: 'error' });
      return;
    }
    // Validate schedule_time
    if (scheduleTime) {
      const selected = new Date(scheduleTime).getTime();
      const now = Date.now();
      if (selected < now) {
        setToast({ message: 'Cannot schedule in the past.', type: 'error' });
        if (scheduleInputRef.current) scheduleInputRef.current.focus();
        return;
      }
    }
    mutation.mutate({
      name,
      template_id: templateId,
      message,
      phone_numbers: numbers,
      schedule_time: scheduleTime || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-2">Create Campaign</h2>
      <Input placeholder="Campaign Name" value={name} onChange={e => setName(e.target.value)} required />
      <Input placeholder="Template ID" value={templateId} onChange={e => setTemplateId(e.target.value)} required />
      <Input placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} required />
      <Input placeholder="Phone Numbers (comma separated)" value={phoneNumbers} onChange={e => setPhoneNumbers(e.target.value)} required />
      <div>
        <label className="block mb-1 font-medium">Schedule Time (optional)</label>
        <input
          ref={scheduleInputRef}
          type="datetime-local"
          value={scheduleTime}
          onChange={e => setScheduleTime(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Campaign'}
      </Button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </form>
  );
}
