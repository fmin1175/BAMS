'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Coach, CoachFormData } from '@/types/coach';
import { useAuth } from '@/contexts/AuthContext';

interface CoachFormProps {
  coach?: Coach;
  isEditing?: boolean;
}

export default function CoachForm({ coach, isEditing = false }: CoachFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CoachFormData>({
    defaultValues: coach ? {
      name: coach.name,
      hourlyRate: coach.hourlyRate,
      sessionRate: coach.sessionRate || 0,
      paymentType: coach.paymentType || 'HOURLY',
      paymentFrequency: coach.paymentFrequency || 'WEEKLY',
      monthlySalary: coach.monthlySalary || 0,
      payoutMethod: coach.payoutMethod,
      bankDetails: coach.bankDetails || '',
      email: coach.email || '',
      contactNumber: coach.contactNumber || ''
    } : {
      paymentType: 'HOURLY',
      paymentFrequency: 'WEEKLY'
    }
  });

  const onSubmit = async (data: CoachFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting coach data:', JSON.stringify(data, null, 2));
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        setError('User not authenticated');
        setIsSubmitting(false);
        return;
      }
      
      const url = isEditing ? `/api/coaches/${coach?.id}` : '/api/coaches';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify({
            academyId: user.academyId
          })
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log('API Response:', response.status, responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to save coach';
        try {
          const errorData = JSON.parse(responseText);
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      router.push('/coaches');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving coach. Please try again.');
      console.error('Form submission error:', err);
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
        <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700">
          Payment Frequency
        </label>
        <select
          id="paymentFrequency"
          {...register('paymentFrequency', { required: 'Payment frequency is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
        {errors.paymentFrequency && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentFrequency.message}</p>
        )}
      </div>

      {watch('paymentFrequency') === 'WEEKLY' && (
        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
            Payment Type
          </label>
          <select
            id="paymentType"
            {...register('paymentType', { required: watch('paymentFrequency') === 'WEEKLY' ? 'Payment type is required' : false })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="HOURLY">Hourly Rate</option>
            <option value="PER_SESSION">Per Session</option>
          </select>
          {errors.paymentType && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentType.message}</p>
          )}
        </div>
      )}

      {watch('paymentFrequency') === 'WEEKLY' && watch('paymentType') === 'HOURLY' && (
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
              required: watch('paymentFrequency') === 'WEEKLY' && watch('paymentType') === 'HOURLY' ? 'Hourly rate is required' : false,
              valueAsNumber: true,
              min: { value: 0, message: 'Hourly rate must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
          )}
        </div>
      )}
      
      {watch('paymentFrequency') === 'WEEKLY' && watch('paymentType') === 'PER_SESSION' && (
        <div>
          <label htmlFor="sessionRate" className="block text-sm font-medium text-gray-700">
            Session Rate ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            id="sessionRate"
            {...register('sessionRate', { 
              required: watch('paymentFrequency') === 'WEEKLY' && watch('paymentType') === 'PER_SESSION' ? 'Session rate is required' : false,
              valueAsNumber: true,
              min: { value: 0, message: 'Session rate must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.sessionRate && (
            <p className="mt-1 text-sm text-red-600">{errors.sessionRate.message}</p>
          )}
        </div>
      )}

      {watch('paymentFrequency') === 'MONTHLY' && (
        <div>
          <label htmlFor="monthlySalary" className="block text-sm font-medium text-gray-700">
            Monthly Salary ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            id="monthlySalary"
            {...register('monthlySalary', { 
              required: watch('paymentFrequency') === 'MONTHLY' ? 'Monthly salary is required' : false,
              valueAsNumber: true,
              min: { value: 0, message: 'Monthly salary must be positive' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.monthlySalary && (
            <p className="mt-1 text-sm text-red-600">{errors.monthlySalary.message}</p>
          )}
        </div>
      )}

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
          {watch('payoutMethod') === 'BANK_TRANSFER' && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id="bankDetails"
          {...register('bankDetails', { 
            required: watch('payoutMethod') === 'BANK_TRANSFER' ? 'Bank details are required for bank transfers' : false 
          })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Account number, routing number, etc."
        />
        {errors.bankDetails && (
          <p className="mt-1 text-sm text-red-600">{errors.bankDetails.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
          <span className="ml-1 text-xs text-gray-500">(Required for coach login account)</span>
        </label>
        <input
          type="email"
          id="email"
          {...register('email', { 
            required: 'Email is required for coach account creation',
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