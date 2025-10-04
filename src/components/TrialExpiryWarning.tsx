'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function TrialExpiryWarning() {
  const { user } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (user?.trialExpiryDate) {
      const expiryDate = new Date(user.trialExpiryDate);
      const currentDate = new Date();
      const timeDiff = expiryDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      setDaysRemaining(daysDiff);
    } else {
      setDaysRemaining(null);
    }
  }, [user]);
  
  if (!daysRemaining || daysRemaining > 30) {
    return null;
  }
  
  // Different warning levels based on days remaining
  let bgColor = 'bg-yellow-50';
  let textColor = 'text-yellow-800';
  let borderColor = 'border-yellow-200';
  
  if (daysRemaining <= 7) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-800';
    borderColor = 'border-red-200';
  } else if (daysRemaining <= 14) {
    bgColor = 'bg-orange-50';
    textColor = 'text-orange-800';
    borderColor = 'border-orange-200';
  }
  
  return (
    <div className={`${bgColor} ${borderColor} ${textColor} border px-4 py-3 rounded-md mb-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {daysRemaining <= 7 ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {daysRemaining <= 7 ? (
              <span className="font-bold">Critical: </span>
            ) : daysRemaining <= 14 ? (
              <span className="font-bold">Warning: </span>
            ) : (
              <span className="font-bold">Notice: </span>
            )}
            Your free trial expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}.
            {daysRemaining <= 14 && (
              <span> Please contact support to upgrade your account to avoid service interruption.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}