'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Player, PlayerFormData } from '@/types/player';

interface PlayerFormProps {
  player?: Player;
  isEditing?: boolean;
}

export default function PlayerForm({ player, isEditing = false }: PlayerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PlayerFormData>({
    defaultValues: player ? {
      name: player.name,
      age: player.age,
      contact: player.contact
    } : {}
  });

  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing ? `/api/players/${player?.id}` : '/api/players';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          age: Number(data.age)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save player');
      }

      router.push('/players');
      router.refresh();
    } catch (err) {
      setError('Error saving player. Please try again.');
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
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          min="1"
          max="100"
          {...register('age', { 
            required: 'Age is required',
            min: { value: 1, message: 'Age must be at least 1' },
            max: { value: 100, message: 'Age must be at most 100' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
          Contact
        </label>
        <input
          type="text"
          id="contact"
          {...register('contact', { required: 'Contact information is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.contact && (
          <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
        )}
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Player' : 'Add Player'}
        </button>
      </div>
    </form>
  );
}