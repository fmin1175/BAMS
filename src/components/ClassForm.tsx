'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Class, ClassFormData } from '@/types/class';
import { Coach } from '@/types/coach';

interface ClassFormProps {
  classData?: Class;
  isEditing?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ClassForm({ classData, isEditing = false }: ClassFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [courts, setCourts] = useState<any[]>([]);

  // Format time for input field
  function formatTimeForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toTimeString().substring(0, 5); // Returns HH:MM format
  }

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ClassFormData>({
    defaultValues: classData ? {
      name: classData.name,
      coachId: classData.coachId,
      courtId: classData.courtId,
      dayOfWeek: classData.dayOfWeek,
      startTime: formatTimeForInput(classData.startTime),
      endTime: formatTimeForInput(classData.endTime),
      isRecurring: classData.isRecurring
    } : {
      isRecurring: true
    }
  });

  // Fetch coaches and courts on component mount
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coaches');
        if (response.ok) {
          const data = await response.json();
          setCoaches(data);
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    const fetchCourts = async () => {
      try {
        const response = await fetch('/api/courts');
        if (response.ok) {
          const data = await response.json();
          setCourts(data);
        } else {
          // If courts API doesn't exist yet, use dummy data
          setCourts([
            { id: 1, name: 'Court 1' },
            { id: 2, name: 'Court 2' },
            { id: 3, name: 'Court 3' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching courts:', error);
        // Fallback to dummy data
        setCourts([
          { id: 1, name: 'Court 1' },
          { id: 2, name: 'Court 2' },
          { id: 3, name: 'Court 3' }
        ]);
      }
    };

    fetchCoaches();
    fetchCourts();
  }, []);

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format the time data
      const formattedData = {
        ...data,
        startTime: `2023-01-01T${data.startTime}:00.000Z`,
        endTime: `2023-01-01T${data.endTime}:00.000Z`,
      };
      
      const url = isEditing ? `/api/classes/${classData?.id}` : '/api/classes';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save class');
      }

      router.push('/classes');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving class. Please try again.');
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
          Class Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Class name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., U12 Beginner"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="coachId" className="block text-sm font-medium text-gray-700">
          Coach
        </label>
        <select
          id="coachId"
          {...register('coachId', { required: 'Coach is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a coach</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name}
            </option>
          ))}
        </select>
        {errors.coachId && (
          <p className="mt-1 text-sm text-red-600">{errors.coachId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="courtId" className="block text-sm font-medium text-gray-700">
          Court
        </label>
        <select
          id="courtId"
          {...register('courtId', { required: 'Court is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a court</option>
          {courts.map((court) => (
            <option key={court.id} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>
        {errors.courtId && (
          <p className="mt-1 text-sm text-red-600">{errors.courtId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
          Day of Week
        </label>
        <select
          id="dayOfWeek"
          {...register('dayOfWeek', { required: 'Day of week is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a day</option>
          {DAYS_OF_WEEK.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
        {errors.dayOfWeek && (
          <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            {...register('startTime', { required: 'Start time is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            {...register('endTime', { 
              required: 'End time is required',
              validate: value => {
                const startTime = watch('startTime');
                return !startTime || value > startTime || 'End time must be after start time';
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isRecurring"
          {...register('isRecurring')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
          Recurring weekly class
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
        </button>
      </div>
    </form>
  );
}