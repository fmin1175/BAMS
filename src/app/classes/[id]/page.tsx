'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Class } from '@/types/class';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/classes/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch class details');
        }
        
        const data = await response.json();
        setClassData(data);
      } catch (err) {
        console.error('Error fetching class:', err);
        setError('Failed to load class details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [params.id]);

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/classes/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      
      router.push('/classes');
    } catch (err) {
      console.error('Error deleting class:', err);
      setError('Failed to delete class. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error || 'Class not found'}</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/classes" 
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{classData.name}</h1>
        <div className="space-x-2">
          <Link 
            href="/classes" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
          <Link 
            href={`/classes/${classData.id}/edit`} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Class Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Schedule and assignment details.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Class Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{classData.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Schedule</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {DAYS_OF_WEEK[classData.dayOfWeek]}, {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                {classData.isRecurring && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Recurring</span>}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Coach</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {classData.coach ? (
                  <Link href={`/coaches/${classData.coach.id}`} className="text-blue-600 hover:underline">
                    {classData.coach.name}
                  </Link>
                ) : 'Not assigned'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Court</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {classData.court ? classData.court.name : 'Not assigned'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {classData.students && classData.students.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Enrolled Students</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{classData.students.length} students enrolled</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {classData.students.map((enrollment) => (
                <li key={enrollment.id} className="px-4 py-4 sm:px-6">
                  <Link href={`/students/${enrollment.student.id}`} className="text-blue-600 hover:underline">
                    {enrollment.student.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}