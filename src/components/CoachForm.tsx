'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Coach, CoachFormData } from '@/types/coach';

interface CoachFormProps {
  coach?: Coach;
  isEditing?: boolean;
}

export default function CoachForm({ coach, isEditing = false }: CoachFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CoachFormData>({
    defaultValues: coach ? {
      name: coach.name,
      hourlyRate: coach.hourlyRate,
      payoutMethod: coach.payoutMethod,
      bankDetails: coach.bankDetails || '',
      email: coach.email || '',
      contactNumber: coach.contactNumber || ''
    } : {}
  });

  const onSubmit = async (data: CoachFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing ? `/api/coaches/${coach?.id}` : '/api/coaches';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save coach');
      }

      router.push('/coaches');
      router.refresh();
    } catch (err) {
      setError('Error saving coach. Please try again.');
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
        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
          Hourly Rate ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          id="hourlyRate"
          {...register('hourlyRate', { 
            required: 'Hourly rate is required',
            valueAsNumber: true,
            min: { value: 0, message: 'Hourly rate must be positive' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.hourlyRate && (
          <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="payoutMethod" className="block text-sm font-medium text-gray-700">
          Payout Method
        </label>
        <select
          id="payoutMethod"
          {...register('payoutMethod', { required: 'Payout method is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a payout method</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CHECK">Check</option>
          <option value="CASH">Cash</option>
          <option value="PAYPAL">PayPal</option>
        </select>
        {errors.payoutMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.payoutMethod.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700">
          Bank Details
        </label>
        <textarea
          id="bankDetails"
          {...register('bankDetails')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Account number, routing number, etc."
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email', { 
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Coach' : 'Create Coach'}
        </button>
      </div>
    </form>
  );
}