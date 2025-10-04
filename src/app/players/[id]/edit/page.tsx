'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StudentForm from '@/components/StudentForm';
import { Student } from '@/types/student';

export default function EditPlayerPage() {
  const { id } = useParams() as { id: string };
  const [player, setPlayer] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player');
        }
        const data = await response.json();
        setPlayer(data);
      } catch (err) {
        setError('Error loading player. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayer();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-4">Loading player...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!player) {
    return <div className="text-center py-4 text-red-500">Player not found</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Edit Player</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Update the player details below.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <StudentForm student={player} isEditing={true} />
      </div>
    </div>
  );
}