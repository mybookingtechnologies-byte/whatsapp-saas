import Button from '../ui/button';

const plans = [
  {
    name: 'Starter',
    price: 499,
    messages: 1000,
    description: 'For small businesses and testing',
    id: 'starter',
  },
  {
    name: 'Pro',
    price: 2999,
    messages: 10000,
    description: 'For growing businesses',
    id: 'pro',
  },
  {
    name: 'Enterprise',
    price: null,
    messages: 'Custom',
    description: 'For large scale needs',
    id: 'enterprise',
  },
];

export default function PricingPlans({ currentPlan, onSelect }: { currentPlan?: string; onSelect: (planId: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
      {plans.map(plan => (
        <div
          key={plan.id}
          className={`rounded-lg shadow p-8 flex flex-col items-center border-2 ${currentPlan === plan.id ? 'border-blue-600' : 'border-gray-200'}`}
        >
          <div className="text-xl font-bold mb-2">{plan.name}</div>
          <div className="text-3xl font-extrabold mb-2">
            {plan.price !== null ? `₹${plan.price}` : 'Contact Us'}
          </div>
          <div className="mb-2">{plan.messages} messages</div>
          <div className="mb-4 text-gray-500">{plan.description}</div>
          <Button
            className={`w-full ${currentPlan === plan.id ? 'bg-blue-600' : ''}`}
            disabled={currentPlan === plan.id}
            onClick={() => onSelect(plan.id)}
          >
            {currentPlan === plan.id ? 'Current Plan' : plan.price !== null ? 'Upgrade' : 'Contact Sales'}
          </Button>
        </div>
      ))}
    </div>
  );
}
