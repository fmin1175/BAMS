'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Class } from '@/types/class';
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

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchClasses = async (search?: string) => {
    try {
      setLoading(true);
      const url = search ? `/api/classes?search=${encodeURIComponent(search)}` : '/api/classes';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      setClasses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Debounced search function
  const debouncedSearch = useDebounce((term: string) => {
    fetchClasses(term);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  useEffect(() => {
    fetchClasses();
    
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      
      // Refresh the list
      fetchClasses(searchTerm);
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Failed to delete class. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Link 
          href="/classes/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add New Class
        </Link>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search classes..."
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
          <p className="text-gray-500">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <p className="text-gray-500">No classes found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{classItem.name}</div>
                    {classItem.isRecurring && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {DAYS_OF_WEEK[classItem.dayOfWeek]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {classItem.coach?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {classItem.court?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                    <Link 
                      href={`/classes/${classItem.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/classes/${classItem.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(classItem.id)}
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