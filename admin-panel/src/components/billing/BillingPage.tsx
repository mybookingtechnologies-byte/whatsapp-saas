import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PricingPlans from './PricingPlans';
import BillingHistory from './BillingHistory';
import Toast from '../ui/toast';

export default function BillingPage() {
  const { data: billing, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing-info'],
    queryFn: async () => (await (await import('@/utils/api')).default.get('/billing/info')).data,
  });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePaymentSuccess = () => {
    setToast({ message: 'Payment successful! Plan upgraded.', type: 'success' });
    setSelectedPlan(null);
    refetch();
  };

  const handlePaymentError = (msg: string) => {
    setToast({ message: msg, type: 'error' });
    setSelectedPlan(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      {isLoading && <div>Loading billing info...</div>}
      {isError && <div className="text-red-500">Failed to load billing info. <button onClick={() => refetch()}>Retry</button></div>}
      {!isLoading && !isError && billing && (
        <>
          <div className="mb-6">
            <div className="font-semibold">Current Plan: <span className="text-blue-600">{billing.current_plan}</span></div>
            <div>Remaining Credits: <span className="font-bold">{billing.remaining_credits}</span></div>
          </div>
          <PricingPlans currentPlan={billing.current_plan} onSelect={handlePlanSelect} />
          <BillingHistory />
        </>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
