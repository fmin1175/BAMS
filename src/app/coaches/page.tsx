'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Coach } from '@/types/coach';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

// Simple debounce implementation
const useDebounce = (callback: Function, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setDebounceTimer(setTimeout(() => callback(...args), delay));
  }, [callback, delay, debounceTimer]);

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
  const router = useRouter();

  const fetchCoaches = async (search?: string) => {
    try {
      setLoading(true);
      const url = search ? `/api/coaches?search=${encodeURIComponent(search)}` : '/api/coaches';
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
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coach?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/coaches/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete coach');
      }
      
      // Refresh the list
      fetchCoaches(searchTerm);
    } catch (err) {
      console.error('Error deleting coach:', err);
      setError('Failed to delete coach. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</th>
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
                    ${coach.hourlyRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coach.payoutMethod.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coach.email && <div>{coach.email}</div>}
                    {coach.phone && <div>{coach.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/coaches/${coach.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/coaches/${coach.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(coach.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}