'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoachForm from '@/components/CoachForm';
import { Coach } from '@/types/coach';

export default function EditCoachPage({ params }: { params: { id: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/coaches/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch coach details');
        }
        
        const data = await response.json();
        setCoach(data);
      } catch (err) {
        console.error('Error fetching coach:', err);
        setError('Failed to load coach details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading coach details...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error || 'Coach not found'}</p>
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
      <h1 className="text-2xl font-bold mb-6">Edit Coach: {coach.name}</h1>
      <CoachForm coach={coach} isEditing={true} />
    </div>
  );
}