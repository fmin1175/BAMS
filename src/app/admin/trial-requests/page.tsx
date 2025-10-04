'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/ActionButton';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TrialRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  academyName: string;
  studentsCount: number;
  status: string;
  createdAt: string;
  expiry: string;
}

// Payload type for updating a trial request via the edit API
type UpdateTrialRequestData = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  academyName?: string;
  status?: string;
  studentsCount?: string;
  expiry?: string | null;
};

export default function TrialRequestsPage() {
  return (
    <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
      <TrialRequestsContent />
    </ProtectedRoute>
  );
}

function TrialRequestsContent() {
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRequest, setEditingRequest] = useState<TrialRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAcademyModal, setShowDeleteAcademyModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<TrialRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<TrialRequest | null>(null);
  const [hasAssociatedAcademy, setHasAssociatedAcademy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTrialRequests();
  }, []);

  const fetchTrialRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/free-trial/list');
      if (!response.ok) {
        throw new Error('Failed to fetch trial requests');
      }
      const data = await response.json();
      setTrialRequests(data);
    } catch (err) {
      setError('Error fetching trial requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request: TrialRequest) => {
    setEditingRequest(request);
  };

  const handleApprove = (request: TrialRequest) => {
    setRequestToApprove(request);
    setShowApproveModal(true);
  };
  
  const handleDelete = async (request: TrialRequest) => {
    setRequestToDelete(request);
    
    // Check if there's an associated academy
    try {
      const response = await fetch(`/api/admin/academies/check?email=${encodeURIComponent(request.email)}`);
      const data = await response.json();
      setHasAssociatedAcademy(data.exists);
      
      if (data.exists) {
        setShowDeleteAcademyModal(true);
      } else {
        setShowDeleteModal(true);
      }
    } catch (err) {
      console.error('Error checking for associated academy:', err);
      setShowDeleteModal(true); // Default to regular delete modal if check fails
    }
  };

  const confirmApprove = async () => {
    if (!requestToApprove) return;
    
    try {
      const response = await fetch('/api/admin/trial-requests/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: requestToApprove.id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve trial request');
      }

      // Refresh the list
      fetchTrialRequests();
      setShowApproveModal(false);
      setRequestToApprove(null);
    } catch (err: any) {
      console.error('Error approving trial request:', err);
      alert(err.message || 'Failed to approve trial request. Please try again.');
    }
  };
  
  const confirmDelete = async (deleteAcademy = false) => {
    if (!requestToDelete) return;
    
    try {
      const response = await fetch(`/api/free-trial/delete?id=${requestToDelete.id}&deleteAcademy=${deleteAcademy}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete trial request');
      }

      // Refresh the list
      fetchTrialRequests();
      setShowDeleteModal(false);
      setShowDeleteAcademyModal(false);
      setRequestToDelete(null);
    } catch (err) {
      console.error('Error deleting trial request:', err);
      alert('Failed to delete trial request. Please try again.');
    }
  };

  const handleSaveEdit = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/trial-requests/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update trial request');
      }

      // Refresh the list
      fetchTrialRequests();
      setEditingRequest(null);
    } catch (err) {
      console.error('Error updating trial request:', err);
      alert('Failed to update trial request. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-4">Loading trial requests...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trial Requests</h1>
      
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Edit Trial Request</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const expiryValue = formData.get('expiry');
              const studentsCount = formData.get('studentsCount');
              
              // Create update data object with only the fields that have values
              const updateData: UpdateTrialRequestData = {
                id: editingRequest.id,
                name: (formData.get('name') as string) || undefined,
                email: (formData.get('email') as string) || undefined,
                phone: (formData.get('phone') as string) || undefined,
                academyName: (formData.get('academyName') as string) || undefined,
                status: (formData.get('status') as string) || undefined,
              };
              
              // Only add studentsCount if it has a value
              if (studentsCount) {
                updateData.studentsCount = String(studentsCount);
              }
              
              // Handle expiry date separately
              if (expiryValue && expiryValue !== '') {
                updateData.expiry = expiryValue as string;
              } else {
                updateData.expiry = null;
              }
              
              handleSaveEdit(updateData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingRequest.name}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingRequest.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingRequest.phone}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academy Name</label>
                  <input
                    type="text"
                    name="academyName"
                    defaultValue={editingRequest.academyName}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Students Count</label>
                  <select
                    name="studentsCount"
                    defaultValue={editingRequest.studentsCount}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value="100+">More than 100</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    defaultValue={editingRequest.status}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry"
                    defaultValue={editingRequest.expiry ? new Date(editingRequest.expiry).toISOString().split('T')[0] : ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApproveModal && requestToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Approve Trial Request</h2>
            <p className="mb-4">
              Are you sure you want to approve the trial request for <strong>{requestToApprove.academyName}</strong>?
            </p>
            <p className="mb-4 text-sm text-gray-600">
              This will create a new academy and an admin user account.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setRequestToApprove(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Academy Name</th>
              <th className="py-2 px-4 border-b text-left">Students</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Created</th>
              <th className="py-2 px-4 border-b text-left">Expiry</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trialRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-4 px-4 text-center">No trial requests found</td>
              </tr>
            ) : (
              trialRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{request.id}</td>
                  <td className="py-2 px-4 border-b">{request.name}</td>
                  <td className="py-2 px-4 border-b">{request.email}</td>
                  <td className="py-2 px-4 border-b">{request.academyName}</td>
                  <td className="py-2 px-4 border-b">{request.studentsCount}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{formatDate(request.createdAt)}</td>
                  <td className="py-2 px-4 border-b">{formatDate(request.expiry)}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <ActionButton
                        variant="edit"
                        onClick={() => handleEdit(request)}
                      />
                      {request.status === 'pending' && (
                        <ActionButton
                          variant="approve"
                          onClick={() => handleApprove(request)}
                        />
                      )}
                      <ActionButton
                        variant="delete"
                        onClick={() => handleDelete(request)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && requestToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete the trial request for <span className="font-semibold">{requestToDelete.academyName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRequestToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Academy Confirmation Modal */}
      {showDeleteAcademyModal && requestToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Academy Found</h2>
            <p>An academy with email {requestToDelete.email} already exists.</p>
            <p className="mt-2">Would you like to delete both the trial request and the associated academy?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteAcademyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Delete Trial Only
              </button>
              <button
                onClick={() => confirmDelete(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Both
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}