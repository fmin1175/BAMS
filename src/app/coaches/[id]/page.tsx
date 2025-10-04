'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coach } from '@/types/coach';
import Cookies from 'js-cookie';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // Get auth token from cookies
      const token = Cookies.get('auth_token');
      
      // Get user data from token
      let userData = null;
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        userData = JSON.parse(jsonPayload);
      }
      
      const response = await fetch(`/api/coaches/${params.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-data': userData ? JSON.stringify(userData) : ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to delete coach';
        setError(errorMessage);
        setShowConfirmDialog(false);
        return;
      }
      
      router.push('/coaches');
    } catch (err: any) {
      console.error('Error deleting coach:', err);
      setError(err.message || 'Failed to delete coach. Please try again.');
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
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
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to delete this coach?</h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
              <dt className="text-sm font-medium text-gray-500">Payment Frequency</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {coach.paymentFrequency === 'WEEKLY' ? 'Weekly' : 'Monthly'}
              </dd>
            </div>
            {coach.paymentFrequency === 'WEEKLY' && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {coach.paymentType === 'PER_SESSION' ? 'Per Session' : 'Hourly'}
                </dd>
              </div>
            )}
            {coach.paymentFrequency === 'WEEKLY' && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {coach.paymentType === 'PER_SESSION' ? 'Session Rate' : 'Hourly Rate'}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${coach.paymentType === 'PER_SESSION' ? 
                    (coach.sessionRate?.toFixed(2) || '0.00') + ' per session' : 
                    coach.hourlyRate.toFixed(2) + ' per hour'}
                </dd>
              </div>
            )}
            {coach.paymentFrequency === 'MONTHLY' && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Monthly Salary</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${coach.monthlySalary?.toFixed(2) || '0.00'} per month
                </dd>
              </div>
            )}
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
            {coach.contactNumber && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{coach.contactNumber}</dd>
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