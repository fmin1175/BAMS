'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ActionButton } from '@/components/ui/ActionButton';

interface Academy {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  headCoach: string | null;
  subscriptionPlan: string;
  isActive: boolean;
  studentsCount?: number;
  coachesCount?: number;
}

export default function AcademiesPage() {
  return (
    <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
      <AcademiesContent />
    </ProtectedRoute>
  );
}

function AcademiesContent() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const router = useRouter();

  const fetchAcademies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/academies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch academies');
      }
      
      const data = await response.json();
      setAcademies(data);
    } catch (err) {
      console.error('Error fetching academies:', err);
      setError('Failed to load academies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademies();
  }, []);

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getSubscriptionBadgeClass = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (academy: Academy) => {
    setCurrentAcademy(academy);
    setShowEditModal(true);
  };

  const handleDelete = (academy: Academy) => {
    setCurrentAcademy(academy);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentAcademy) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/academies/delete?id=${currentAcademy.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete academy');
      }
      
      // Refresh academies list
      fetchAcademies();
      setShowDeleteModal(false);
      toast.success('Academy deleted successfully');
    } catch (error) {
      console.error('Error deleting academy:', error);
      toast.error('Failed to delete academy');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Academy List</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : academies.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg">No academies found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Coach</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coaches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {academies.map((academy) => (
                <tr key={academy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{academy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{academy.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{academy.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{academy.headCoach || 'Not assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{academy.studentsCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{academy.coachesCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionBadgeClass(academy.subscriptionPlan)}`}>
                      {academy.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(academy.isActive)}`}>
                      {academy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButton 
                      variant="edit"
                      onClick={() => handleEdit(academy)}
                    />
                    <ActionButton 
                      variant="delete"
                      onClick={() => handleDelete(academy)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}