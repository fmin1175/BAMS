'use client';

import Link from 'next/link';
import StudentList from '@/components/StudentList';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ACADEMY_ADMIN', 'SYSTEM_ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Students</h1>
          <Link href="/students/add" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Add New Student
          </Link>
        </div>
        <StudentList />
      </div>
    </ProtectedRoute>
  );
}