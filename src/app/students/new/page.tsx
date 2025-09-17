import StudentForm from '@/components/StudentForm';

export default function NewStudentPage() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Add New Student</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Enter the student details below.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <StudentForm />
      </div>
    </div>
  );
}