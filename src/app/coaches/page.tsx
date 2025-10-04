'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Coach } from '@/types/coach';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ActionButton } from '@/components/ui/ActionButton';
import { useAuth } from '@/contexts/AuthContext';

// Simple debounce implementation
interface DebouncedFunction {
  (...args: any[]): void;
  cancel: () => void;
}

const useDebounce = (callback: Function, delay: number): DebouncedFunction => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setDebounceTimer(setTimeout(() => callback(...args), delay));
  }, [callback, delay, debounceTimer]) as DebouncedFunction;

  // Add cancel method to match lodash debounce API
  debouncedCallback.cancel = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(undefined);
    }
  };

  return debouncedCallback;
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchCoaches = async (search?: string) => {
    try {
      setLoading(true);
      
      // Build URL with search and academyId parameters if applicable
      let url = '/api/coaches';
      const params = new URLSearchParams();
      
      if (search) {
        params.append('search', search);
      }
      
      // Add academyId parameter for Academy Admins
      if (user && user.role === 'ACADEMY_ADMIN' && user.academyId) {
        params.append('academyId', user.academyId.toString());
      }
      
      // Append parameters to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch coaches');
      }
      
      const data = await response.json();
      setCoaches(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError('Failed to load coaches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebounce((term: string) => {
    fetchCoaches(term);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  useEffect(() => {
    fetchCoaches();
    
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [user]);

  const confirmDelete = (id: number) => {
    setCoachToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (coachToDelete === null) return;
    
    try {
      // Add authentication headers similar to fetchCoaches
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add user data for authentication if available
      if (user && user.academyId) {
        headers['x-user-data'] = JSON.stringify({
          academyId: user.academyId,
          role: user.role
        });
      }
      
      const response = await fetch(`/api/coaches/${coachToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        // Get the detailed error message from the response
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete coach');
      }
      
      // Refresh the list
      fetchCoaches(searchTerm);
      // Reset state
      setCoachToDelete(null);
      setShowConfirmDialog(false);
    } catch (err: any) {
      console.error('Error deleting coach:', err);
      setError(err.message || 'Failed to delete coach. Please try again.');
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setCoachToDelete(null);
    setShowConfirmDialog(false);
  };

  return (
    <ProtectedRoute allowedRoles={['ACADEMY_ADMIN', 'SYSTEM_ADMIN']}>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coaches</h1>
        <Link 
          href="/coaches/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add New Coach
        </Link>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search coaches..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this coach?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading coaches...</p>
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <p className="text-gray-500">No coaches found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{coach.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coach.paymentFrequency === 'WEEKLY' ? (
                        coach.paymentType === 'PER_SESSION' ? 
                          <>
                            ${coach.sessionRate?.toFixed(2)} per session (Weekly)
                          </> : 
                          <>
                            ${coach.hourlyRate.toFixed(2)} per hour (Weekly)
                          </>
                      ) : (
                        <>
                          ${coach.monthlySalary?.toFixed(2)} per month
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coach.payoutMethod.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coach.email && <div>{coach.email}</div>}
                      {coach.contactNumber && <div>{coach.contactNumber}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <ActionButton
                          variant="edit"
                          href={`/coaches/${coach.id}/edit`}
                        />
                        <ActionButton
                          variant="delete"
                          onClick={() => confirmDelete(coach.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}