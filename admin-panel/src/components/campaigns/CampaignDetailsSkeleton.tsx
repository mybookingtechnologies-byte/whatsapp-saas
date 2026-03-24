import { useRouter } from 'next/navigation';

export default function CampaignDetailsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
      <div className="h-6 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-1/4 bg-gray-200 rounded mb-6" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-10 w-full bg-gray-200 rounded mt-6" />
    </div>
  );
}
