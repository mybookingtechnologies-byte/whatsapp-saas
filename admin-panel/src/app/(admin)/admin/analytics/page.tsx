"use client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";

const COLORS = ["#2563eb", "#10b981", "#f59e42", "#f43f5e", "#6366f1", "#eab308", "#14b8a6"];

function AnalyticsCard({ label, value, icon, className = "" }) {
  return (
    <div className={`bg-white rounded shadow p-4 flex items-center gap-4 min-h-[90px] ${className}`}>
      {icon && <div>{icon}</div>}
      <div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        <div className="text-gray-500 text-xs font-medium mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<'7d'|'30d'>('7d');
  const summary = useQuery({
    queryKey: ["admin-analytics-summary"],
    queryFn: async () => (await fetch("/admin/analytics/summary")).json(),
    refetchInterval: 10000,
  });
  const revenue = useQuery({
    queryKey: ["admin-analytics-revenue", range],
    queryFn: async () => (await fetch(`/admin/analytics/revenue?range=${range}`)).json(),
    refetchInterval: 10000,
  });
  const plans = useQuery({
    queryKey: ["admin-analytics-plans"],
    queryFn: async () => (await fetch("/admin/analytics/plans")).json(),
    refetchInterval: 10000,
  });

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button className={range==='7d' ? 'bg-blue-600' : 'bg-gray-200 text-black'} onClick={() => setRange('7d')}>Last 7 days</Button>
          <Button className={range==='30d' ? 'bg-blue-600' : 'bg-gray-200 text-black'} onClick={() => setRange('30d')}>Last 30 days</Button>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {summary.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : summary.isError ? (
          <div className="col-span-6 text-red-500">Failed to load analytics. <Button onClick={() => summary.refetch()}>Retry</Button></div>
        ) : (
          [
            { key: 'total_revenue', value: summary.data.total_revenue, label: 'Total Revenue' },
            { key: 'today_revenue', value: summary.data.today_revenue, label: 'Today Revenue' },
            { key: 'monthly_revenue', value: summary.data.monthly_revenue, label: 'Monthly Revenue' },
            { key: 'pending_payments', value: summary.data.pending_payments, label: 'Pending Payments' },
            { key: 'approved_payments', value: summary.data.approved_payments, label: 'Approved Payments' },
            { key: 'active_users', value: summary.data.active_users, label: 'Active Users' },
          ].map(card => <AnalyticsCard key={card.key} {...card} />)
        )}
      </div>
      {/* Revenue Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2 flex items-center gap-2">Revenue Chart</div>
          {revenue.isLoading ? <Skeleton className="h-64" /> : revenue.isError ? <div className="text-red-500">Failed to load. <Button onClick={() => revenue.refetch()}>Retry</Button></div> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenue.data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2 flex items-center gap-2">Plan Distribution</div>
          {plans.isLoading ? <Skeleton className="h-64" /> : plans.isError ? <div className="text-red-500">Failed to load. <Button onClick={() => plans.refetch()}>Retry</Button></div> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={plans.data} dataKey="count" nameKey="planName" cx="50%" cy="50%" outerRadius={80} label>
                  {plans.data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* Payment Analytics */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <div className="font-semibold mb-4 flex items-center gap-2">Payment Analytics</div>
        {summary.isLoading ? <Skeleton className="h-16" /> : summary.isError ? <div className="text-red-500">Failed to load. <Button onClick={() => summary.refetch()}>Retry</Button></div> : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold">{summary.data.total_payments}</div>
              <div className="text-gray-500 text-xs">Total Payments</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-green-600">{summary.data.approved}</div>
              <div className="text-gray-500 text-xs">Approved</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-orange-500">{summary.data.pending}</div>
              <div className="text-gray-500 text-xs">Pending</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-red-600">{summary.data.rejected}</div>
              <div className="text-gray-500 text-xs">Rejected</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold">{summary.data.success_rate}%</div>
              <div className="text-gray-500 text-xs">Success Rate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
