'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClassForm from '@/components/ClassForm';
import { Class } from '@/types/class';

export default function EditClassPage({ params }: { params: { id: string } }) {
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
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Class: {classData.name}</h1>
      <ClassForm classData={classData} isEditing={true} />
    </div>
  );
}