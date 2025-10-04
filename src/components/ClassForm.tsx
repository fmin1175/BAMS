'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Class, ClassFormData } from '@/types/class';
import { Coach } from '@/types/coach';
import { Student } from '@/types/student';
import { useAuth } from '@/contexts/AuthContext';

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
  const [locations, setLocations] = useState<{id: number, name: string, address: string}[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const auth = useAuth();

  // Format time for input field without timezone conversion
  function formatTimeForInput(dateString: string | Date): string {
    if (dateString instanceof Date) {
      // For Date objects, extract hours and minutes directly
      return `${String(dateString.getHours()).padStart(2, '0')}:${String(dateString.getMinutes()).padStart(2, '0')}`;
    } else if (typeof dateString === 'string') {
      // For ISO strings, extract the time part directly
      if (dateString.includes('T')) {
        // Extract HH:MM from ISO format
        const timePart = dateString.split('T')[1];
        return timePart.substring(0, 5);
      } else if (dateString.includes(':')) {
        // For simple time strings like "HH:MM:SS"
        return dateString.substring(0, 5);
      }
    }
    
    // Fallback to empty string if format is unrecognized
    return '';
  }

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClassFormData>({
    defaultValues: classData ? {
      name: classData.name,
      coachId: classData.coachId,
      locationId: classData.locationId,
      dayOfWeek: classData.dayOfWeek,
      startTime: formatTimeForInput(classData.startTime),
      endTime: formatTimeForInput(classData.endTime),
      isRecurring: classData.isRecurring,
      studentIds: classData.students?.map(enrollment => enrollment.studentId) || []
    } : {
      isRecurring: true,
      studentIds: []
    }
  });

  // Fetch coaches and locations based on logged-in user's academy
  useEffect(() => {
    if (!auth || !auth.user) return;
    const academyId = auth.user.academyId;
    
    const fetchCoaches = async () => {
      try {
        // Filter coaches by academyId if available
        const url = academyId ? `/api/coaches?academyId=${academyId}` : '/api/coaches';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCoaches(data);
          
          // If editing and we have class data with a coach ID, ensure it's selected
          if (isEditing && classData && classData.coachId) {
            setValue('coachId', classData.coachId);
          }
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        // Get locations from the settings API
        const url = '/api/settings';
        const response = await fetch(url, {
          headers: {
            'x-user-data': JSON.stringify({ academyId })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Extract locations from the settings response
          if (data && data.locations && Array.isArray(data.locations)) {
            setLocations(data.locations);
            
            // If editing and we have class data with a location ID, ensure it's selected
            if (isEditing && classData && classData.locationId) {
              setValue('locationId', classData.locationId);
            }
          } else {
            console.error('No locations found in settings response');
            setLocations([]);
          }
        } else {
          console.error('Error fetching settings: API returned non-OK status', response.status);
          setLocations([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };

    const fetchStudents = async () => {
      try {
        // Get students from the academy
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (academyId) {
          headers['x-user-data'] = JSON.stringify({ academyId });
        }
        
        const response = await fetch('/api/students', { headers });
        
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
          
          // If editing and we have class data with students, set the selected students
          if (isEditing && classData && classData.students) {
            const studentIds = classData.students.map(enrollment => enrollment.studentId);
            setSelectedStudents(studentIds);
            setValue('studentIds', studentIds);
          }
        } else {
          console.error('Error fetching students: API returned non-OK status', response.status);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchCoaches();
    fetchLocations();
    fetchStudents();
  }, [auth?.user, isEditing, classData, setValue]);

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format the time data
      const formattedData = {
        ...data,
        startTime: `2023-01-01T${data.startTime}:00.000Z`,
        endTime: `2023-01-01T${data.endTime}:00.000Z`,
        studentIds: selectedStudents
      };
      
      const url = isEditing ? `/api/classes/${classData?.id}` : '/api/classes';
      const method = isEditing ? 'PUT' : 'POST';
      
      // Set headers with authentication data from context
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add user data to headers if available
      if (auth?.user) {
        headers['x-user-data'] = JSON.stringify({ academyId: auth.user.academyId });
      }
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formattedData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
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
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <select
          id="locationId"
          {...register('locationId', { required: 'Location is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name && typeof location.name === 'string' ? location.name : ''} 
              {location.address && typeof location.address === 'string' ? `(${location.address})` : ''}
            </option>
          ))}
        </select>
        {errors.locationId && (
          <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enroll Students
        </label>
        <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No students available</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setSelectedStudents(prev => {
                      const newSelection = isChecked 
                        ? [...prev, student.id] 
                        : prev.filter(id => id !== student.id);
                      setValue('studentIds', newSelection);
                      return newSelection;
                    });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-700">
                  {student.name}
                </label>
              </div>
            ))
          )}
        </div>
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