import Link from 'next/link';
import StudentList from '@/components/StudentList';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">Students</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all students in your academy.</p>
            </div>
            <Link 
              href="/students/new" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add New Student
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <StudentList />
        </div>
      </div>
    </ProtectedRoute>
  );
}