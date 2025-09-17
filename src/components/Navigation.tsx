'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { isAuthenticated, user, academy, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-gray-700">
            Badminton Academy Management System
          </Link>
          
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Protected navigation links */}
                <Link href="/students" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Students
                </Link>
                <Link href="/coaches" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Coaches
                </Link>
                <Link href="/classes" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Classes
                </Link>
                <Link href="/attendance" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Attendance
                </Link>
                <Link href="/reports/attendance" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Reports
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Settings
                </Link>
                
                {/* User info and logout */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  {user && (
                    <span className="text-sm text-gray-600">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Public navigation links */}
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}