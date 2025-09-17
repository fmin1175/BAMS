'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StudentForm from '@/components/StudentForm';
import { Student } from '@/types/student';

export default function EditStudentPage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student');
        }
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError('Error loading student. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

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