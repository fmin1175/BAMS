'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StudentForm from '@/components/StudentForm';
import { Student } from '@/types/student';
import { useAuth } from '@/contexts/AuthContext';

export default function EditStudentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to be ready before fetching
    if (authLoading) return;
    
    // Create a separate function to handle the fetch operation
    const fetchStudent = async () => {
      try {
        // Check if user is authenticated using AuthContext
        if (!isAuthenticated || !user) {
          console.error('User not authenticated');
          setError('Authentication required. Please log in to continue.');
          setLoading(false);
          return;
        }
        
        // Use the user data from AuthContext
        
        // Include user data in the request header
        const response = await fetch(`/api/students/${id}`, {
          headers: {
            'x-user-data': JSON.stringify({
              academyId: user.academyId,
              role: user.role
            }),
            'Cache-Control': 'no-store'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch student: ${response.status}`);
        }
        
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error loading student. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only run on the client side
    if (typeof window !== 'undefined' && id) {
      fetchStudent();
    }
  }, [id, user, isAuthenticated, authLoading]);

  if (loading) {
    return <div className="text-center py-4">Loading student...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!student) {
    return <div className="text-center py-4 text-red-500">Student not found</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Edit Student</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Update the student details below.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <StudentForm student={student} isEditing={true} />
      </div>
    </div>
  );
}