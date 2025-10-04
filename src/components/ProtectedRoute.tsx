'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // For debugging
    console.log('ProtectedRoute - Auth state:', { 
      isAuthenticated, 
      userRole: user?.role, 
      allowedRoles 
    });

    if (!loading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Skip role check if no roles specified
      if (!allowedRoles || allowedRoles.length === 0) {
        console.log('No roles specified, allowing access');
        return;
      }
      
      // Check role-based access
      if (user) {
        // Case-insensitive comparison
        const hasAccess = allowedRoles.some(role => 
          role.toUpperCase() === user.role.toUpperCase()
        );
        
        console.log('Role check:', { 
          userRole: user.role, 
          allowedRoles,
          hasAccess
        });
        
        if (!hasAccess) {
          console.log('Access denied - redirecting to unauthorized');
          router.push('/unauthorized');
        }
      }
    }
  }, [isAuthenticated, loading, router, allowedRoles, user]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.some(role => 
    role.toUpperCase() === user.role.toUpperCase()
  ))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}