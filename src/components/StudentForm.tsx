'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Student, StudentFormData } from '@/types/student';

interface StudentFormProps {
  student?: Student;
  isEditing?: boolean;
}

export default function StudentForm({ student, isEditing = false }: StudentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<StudentFormData>({
    defaultValues: student ? {
      name: student.name,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      guardianName: student.guardianName,
      contactNumber: student.contactNumber,
      medicalNotes: student.medicalNotes || ''
    } : {}
  });

  // Watch the dateOfBirth field to calculate age
  const watchedDateOfBirth = watch('dateOfBirth');
  
  // Calculate age from date of birth
  const calculatedAge = useMemo(() => {
    if (!watchedDateOfBirth) return null;
    
    const birthDate = new Date(watchedDateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }, [watchedDateOfBirth]);

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing ? `/api/students/${student?.id}` : '/api/students';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save student');
      }

      router.push('/students');
      router.refresh();
    } catch (err) {
      setError('Error saving student. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          {...register('dateOfBirth', { required: 'Date of Birth is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
        )}
      </div>

      {/* Age Display - Readonly calculated field */}
      {calculatedAge !== null && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            type="text"
            value={`${calculatedAge} years old`}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm text-gray-600"
          />
        </div>
      )}

      {/* Registration Date Display - Show only when editing */}
      {isEditing && student?.registrationDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Date
          </label>
          <input
            type="text"
            value={new Date(student.registrationDate).toLocaleDateString()}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm text-gray-600"
          />
        </div>
      )}

      <div>
        <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">
          Guardian Name
        </label>
        <input
          type="text"
          id="guardianName"
          {...register('guardianName', { required: 'Guardian name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.guardianName && (
          <p className="mt-1 text-sm text-red-600">{errors.guardianName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
          Contact Number
        </label>
        <input
          type="tel"
          id="contactNumber"
          {...register('contactNumber', { required: 'Contact number is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.contactNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700">
          Medical Notes (Optional)
        </label>
        <textarea
          id="medicalNotes"
          rows={3}
          {...register('medicalNotes')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}