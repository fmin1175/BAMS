'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coach } from '@/types/coach';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/coaches/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch coach details');
        }
        
        const data = await response.json();
        setCoach(data);
      } catch (err) {
        console.error('Error fetching coach:', err);
        setError('Failed to load coach details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this coach?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/coaches/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete coach');
      }
      
      router.push('/coaches');
    } catch (err) {
      console.error('Error deleting coach:', err);
      setError('Failed to delete coach. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading coach details...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error || 'Coach not found'}</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/coaches" 
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Coaches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{coach.name}</h1>
        <div className="space-x-2">
          <Link 
            href="/coaches" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
          <Link 
            href={`/coaches/${coach.id}/edit`} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Coach Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal and payment details.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{coach.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${coach.hourlyRate.toFixed(2)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payout Method</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{coach.payoutMethod.replace('_', ' ')}</dd>
            </div>
            {coach.email && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{coach.email}</dd>
              </div>
            )}
            {coach.phone && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{coach.phone}</dd>
              </div>
            )}
            {coach.bankDetails && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bank Details</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{coach.bankDetails}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}