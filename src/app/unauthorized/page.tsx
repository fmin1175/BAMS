'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <p className="text-gray-700 mb-6">
            You don't have permission to access this page. This area is restricted to users with appropriate access rights.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mb-6">
              You are logged in as <span className="font-semibold">{user.firstName} {user.lastName}</span> with role <span className="font-semibold">{user.role}</span>.
            </p>
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}