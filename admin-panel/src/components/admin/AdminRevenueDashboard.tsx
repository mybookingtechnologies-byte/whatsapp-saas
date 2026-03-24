
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { HiCurrencyRupee, HiUserGroup, HiCheckCircle, HiClock, HiUser, HiChartPie, HiDocumentText } from 'react-icons/hi2';
import Button from '../ui/button';

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#a78bfa'];

const CARD_META = [
  { key: 'total_revenue', label: 'Total Revenue', icon: <HiCurrencyRupee className="w-7 h-7 text-blue-600" /> },
  { key: 'today_revenue', label: 'Today Revenue', icon: <HiClock className="w-7 h-7 text-yellow-500" /> },
  { key: 'monthly_revenue', label: 'Monthly Revenue', icon: <HiChartPie className="w-7 h-7 text-purple-600" /> },
  { key: 'pending_payments', label: 'Pending Payments', icon: <HiClock className="w-7 h-7 text-orange-500" /> },
  { key: 'approved_payments', label: 'Approved Payments', icon: <HiCheckCircle className="w-7 h-7 text-green-600" /> },
  { key: 'active_users', label: 'Active Users', icon: <HiUserGroup className="w-7 h-7 text-indigo-600" /> },
];

export default function AdminRevenueDashboard() {
  const [range, setRange] = useState<'7d'|'30d'>('7d');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-revenue', range],
    queryFn: async () => (await api.get('/admin/revenue', { params: { range } })).data,
    refetchInterval: 0,
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(2)].map((_,i) => <div key={i} className="h-8 w-40 bg-gray-200 animate-pulse rounded" />)}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_,i) => <div key={i} className="h-28 bg-gray-200 animate-pulse rounded" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
  if (isError) return <div className="text-red-500">Failed to load analytics. <Button onClick={() => refetch()}>Retry</Button></div>;
  if (!data) return <div>No analytics data found.</div>;

  // Cards
  const cards = [
    { key: 'total_revenue', value: data.total_revenue, label: 'Total Revenue', icon: <HiCurrencyRupee className="w-7 h-7 text-blue-600" /> },
    { key: 'today_revenue', value: data.today_revenue, label: 'Today Revenue', icon: <HiClock className="w-7 h-7 text-yellow-500" /> },
    { key: 'monthly_revenue', value: data.monthly_revenue, label: 'Monthly Revenue', icon: <HiChartPie className="w-7 h-7 text-purple-600" /> },
    { key: 'pending_payments', value: data.pending_payments, label: 'Pending Payments', icon: <HiClock className="w-7 h-7 text-orange-500" /> },
    { key: 'approved_payments', value: data.approved_payments, label: 'Approved Payments', icon: <HiCheckCircle className="w-7 h-7 text-green-600" /> },
    { key: 'active_users', value: data.active_users, label: 'Active Users', icon: <HiUserGroup className="w-7 h-7 text-indigo-600" /> },
  ];

  // Payment analytics
  const totalPayments = data.payment_analytics?.total || 0;
  const approved = data.payment_analytics?.approved || 0;
  const pending = data.payment_analytics?.pending || 0;
  const rejected = data.payment_analytics?.rejected || 0;
  const successRate = totalPayments > 0 ? Math.round((approved / totalPayments) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button className={range==='7d' ? 'bg-blue-600' : 'bg-gray-200 text-black'} onClick={() => setRange('7d')}>Last 7 days</Button>
          <Button className={range==='30d' ? 'bg-blue-600' : 'bg-gray-200 text-black'} onClick={() => setRange('30d')}>Last 30 days</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.key} className="bg-white rounded shadow p-4 flex items-center gap-4 min-h-[90px]">
            <div>{card.icon}</div>
            <div>
              <div className="text-2xl font-bold leading-tight">{card.key.includes('revenue') ? `₹${card.value}` : card.value}</div>
              <div className="text-gray-500 text-xs font-medium mt-1">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2 flex items-center gap-2"><HiChartPie className="w-5 h-5 text-blue-600" /> Revenue Chart</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.revenue_over_time} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2 flex items-center gap-2"><HiUser className="w-5 h-5 text-green-600" /> Plan Distribution</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.plan_distribution} dataKey="value" nameKey="plan" cx="50%" cy="50%" outerRadius={80} label>
                {data.plan_distribution.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded shadow p-6 mb-8">
        <div className="font-semibold mb-4 flex items-center gap-2"><HiDocumentText className="w-5 h-5 text-indigo-600" /> Payment Analytics</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold">{totalPayments}</div>
            <div className="text-gray-500 text-xs">Total Payments</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-green-600">{approved}</div>
            <div className="text-gray-500 text-xs">Approved</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-yellow-500">{pending}</div>
            <div className="text-gray-500 text-xs">Pending</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-red-600">{rejected}</div>
            <div className="text-gray-500 text-xs">Rejected</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-blue-600">{successRate}%</div>
            <div className="text-gray-500 text-xs">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
