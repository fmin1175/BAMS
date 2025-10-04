'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Class } from '@/types/class';
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

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchClasses = async (search?: string) => {
    try {
      setLoading(true);
      
      // Build URL with search and academyId parameters if applicable
      let url = '/api/classes';
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
      
      // Add authentication header
      const headers: HeadersInit = {};
      if (user && user.academyId) {
        headers['x-user-data'] = JSON.stringify({ academyId: user.academyId });
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      
      const data = await response.json();
      
      // Log the raw data to see what we're getting from the API
      console.log("Raw class data from API:", data);
      if (data.length > 0) {
        console.log("First class startTime:", data[0].startTime);
        console.log("First class startTime type:", typeof data[0].startTime);
      }
      
      setClasses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time for display - Direct display without timezone conversion
  const formatTime = (timeString: string | Date) => {
    if (!timeString) return "Time not available";
    
    let hours = 0;
    let minutes = 0;
    
    // Handle Date objects
    if (timeString instanceof Date) {
      // Use local time methods to avoid timezone conversion
      hours = timeString.getHours();
      minutes = timeString.getMinutes();
    } 
    // Handle string inputs
    else if (typeof timeString === 'string') {
      // For ISO format strings with T separator
      if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        const [h, m] = timePart.split(':').map(Number);
        hours = h;
        minutes = m;
      } 
      // For simple time strings like "10:00:00"
      else if (timeString.includes(':')) {
        const [h, m] = timeString.split(':').map(Number);
        hours = h;
        minutes = m;
      }
    }
    
    // Format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
  }, [user]);

  const confirmDelete = (id: number) => {
    setClassToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (classToDelete === null) return;
    
    try {
      // Add authentication headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add user data to headers if available
      if (user && user.academyId) {
        headers['x-user-data'] = JSON.stringify({ academyId: user.academyId });
      }
      
      const response = await fetch(`/api/classes/${classToDelete}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      
      // Refresh the list
      fetchClasses(searchTerm);
      // Reset state
      setClassToDelete(null);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Failed to delete class. Please try again.');
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setClassToDelete(null);
    setShowConfirmDialog(false);
  };

  return (
    <ProtectedRoute allowedRoles={['ACADEMY_ADMIN', 'SYSTEM_ADMIN']}>
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
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this class?</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
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
                    {classItem.location?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                    <ActionButton 
                      variant="edit"
                      href={`/classes/${classItem.id}/edit`}
                    />
                    <ActionButton
                      variant="delete"
                      onClick={() => confirmDelete(classItem.id)}
                    />
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