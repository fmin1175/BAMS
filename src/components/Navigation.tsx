'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import TrialExpiryWarning from './TrialExpiryWarning';

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAuthenticated && <TrialExpiryWarning />}
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center font-bold text-gray-900 hover:text-gray-700 truncate max-w-[200px] sm:max-w-none">
            <img src="/logo.png" alt="Badminton Logo" className="h-10 w-10 mr-2" style={{objectFit: 'contain'}} />
            <span className="hidden sm:inline text-lg sm:text-xl">Badminton Academy Management System</span>
            <span className="sm:hidden text-lg">BAMS</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{display: 'block'}}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* System Admin links */}
                {user?.role === 'SYSTEM_ADMIN' && (
                  <>
                    <Link href="/admin/trial-requests" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Free Trials
                    </Link>
                    <Link href="/admin/academies" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Academies
                    </Link>
                    <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Users
                    </Link>
                  </>
                )}

                {/* Academy Admin links */}
                {user?.role === 'ACADEMY_ADMIN' && (
                  <>
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
                    <div className="relative group">
                      <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                        Reports
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute left-0 top-full w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          <Link href="/reports/attendance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Attendance Reports
                          </Link>
                          <Link href="/reports/coaches" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Coach Weekly Reports
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Link href="/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Settings
                    </Link>
                  </>
                )}

                {/* Coach links */}
                {user?.role === 'COACH' && (
                  <>
                    <Link href="/attendance" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Attendance
                    </Link>
                    <Link href="/settings/password" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                      Change Password
                    </Link>
                  </>
                )}
                
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
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                {/* System Admin links */}
                {user?.role === 'SYSTEM_ADMIN' && (
                  <>
                    <Link 
                      href="/admin/free-trials" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Free Trials
                    </Link>
                    <Link 
                      href="/admin/academies" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Academies
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Users
                    </Link>
                  </>
                )}
                
                {/* Academy Admin links */}
                {user?.role === 'ACADEMY_ADMIN' && (
                  <>
                    <Link 
                      href="/students" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Students
                    </Link>
                    <Link 
                      href="/coaches" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Coaches
                    </Link>
                    <Link 
                      href="/classes" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Classes
                    </Link>
                    <Link 
                      href="/attendance" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Attendance
                    </Link>
                    <div className="pl-3 mb-2">
                      <div className="text-gray-600 font-medium text-sm mb-1">Reports:</div>
                      <Link 
                        href="/reports/attendance" 
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium block ml-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Attendance Reports
                      </Link>
                      <Link 
                        href="/reports/coaches" 
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium block ml-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Coach Weekly Reports
                      </Link>
                    </div>
                    <Link 
                      href="/settings" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </>
                )}
                
                {/* Coach links */}
                {user?.role === 'COACH' && (
                  <>
                    <Link 
                      href="/attendance" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Attendance
                    </Link>
                    <Link 
                      href="/settings/password" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Change Password
                    </Link>
                  </>
                )}
                
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                  {user && (
                    <span className="text-sm text-gray-600">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}