'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/ActionButton';
import { Student } from '@/types/student';
import { useAuth } from '@/contexts/AuthContext';

export default function PlayerList() {
  const [players, setPlayers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Add academyId to API call if user is an ACADEMY_ADMIN
        let url = '/api/players';
        if (user && user.role === 'ACADEMY_ADMIN' && user.academyId) {
          url = `/api/players?academyId=${user.academyId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        setError('Error loading players. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this player?')) {
      try {
        const response = await fetch(`/api/players/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete player');
        }

        setPlayers(players.filter(player => player.id !== id));
      } catch (err) {
        setError('Error deleting player. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading players...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No players found.</p>
        <Link 
          href="/players/new" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Your First Player
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map((player) => (
            <tr key={player.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{player.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{player.age}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{player.contact}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ActionButton
                  variant="edit"
                  href={`/players/${player.id}/edit`}
                />
                <ActionButton
                  variant="delete"
                  onClick={() => handleDelete(player.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}