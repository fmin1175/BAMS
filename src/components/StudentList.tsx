'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/ActionButton';
import { Student } from '@/types/student';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const url = searchTerm 
          ? `/api/students?search=${encodeURIComponent(searchTerm)}` 
          : '/api/students';
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        // Add user data to headers if available
        if (user) {
          headers['x-user-data'] = JSON.stringify({
            academyId: user.academyId,
            role: user.role
          });
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError('Error loading students. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const confirmDelete = (id: number) => {
    setStudentToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (studentToDelete === null) return;
    
    try {
      // Add user data to headers if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['x-user-data'] = JSON.stringify({
          academyId: user.academyId,
          role: user.role
        });
      }
      
      const response = await fetch(`/api/students/${studentToDelete}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      setStudents(students.filter(student => student.id !== studentToDelete));
      setShowConfirmDialog(false);
      setStudentToDelete(null);
    } catch (err) {
      setError('Error deleting student. Please try again.');
      console.error(err);
      setShowConfirmDialog(false);
    }
  };

  const cancelDelete = () => {
    setStudentToDelete(null);
    setShowConfirmDialog(false);
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this student?</p>
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
      
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="Search by name or ID..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No students found.</p>
          <Link 
            href="/students/new" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Your First Student
          </Link>
        </div>
      ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monthly Fee
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{student.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{student.age}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">${student.monthlyFee.toFixed(2)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{student.contact}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButton
                  variant="edit"
                  href={`/students/${student.id}/edit`}
                />
                <ActionButton
                  variant="delete"
                  onClick={() => confirmDelete(student.id)}
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