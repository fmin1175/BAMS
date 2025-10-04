'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import FreeTrialForm from '@/components/FreeTrialForm';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFreeTrialForm, setShowFreeTrialForm] = useState(false);

  const openFreeTrialForm = () => {
    setShowFreeTrialForm(true);
    // Call the show method on the window object
    if (typeof window !== 'undefined' && window.showFreeTrialForm) {
      window.showFreeTrialForm();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Free Trial Form Modal */}
      <FreeTrialForm onClose={() => setShowFreeTrialForm(false)} />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Badminton Logo" className="h-10 w-10 mr-2" style={{objectFit: 'contain'}} />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">Badminton Academy Management System</span>
                <span className="sm:hidden">BAMS</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600">Testimonials</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a 
                  href="#pricing" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <Link 
                  href="/login" 
                  className="block mx-3 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Badminton Academy Management
                <span className="block text-blue-600">Made Simple</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Automate tasks, collect payments online, generate leads, mark attendance and engage with clients better. 
                One stop solution for your Sports Academy.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={openFreeTrialForm}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
                >
                  Start Free Trial
                </button>
                <button 
                  onClick={() => alert("Demo booking is coming soon! Please check back later.")}
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 font-semibold text-lg cursor-pointer"
                >
                  Book a Demo
                </button>
              </div>
            </div>
            
            {/* Management System Circular Diagram - Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-96 h-96 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                <img 
                  src="/bams.png" 
                  alt="Badminton Academy Management System Diagram"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to manage your academy
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed specifically for sports academies
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Student Management */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-600 mb-4">Track student registrations, profiles, attendance, and progress. Generate performance reports with ease.</p>
              <Link href="/students" className="text-blue-600 font-medium hover:text-blue-700">
                Manage Students →
              </Link>
            </div>

            {/* Coach Management */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                {/* Badminton Coach Icon */}
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 15.9 11 17 11V20C17 20.6 16.6 21 16 21H15C14.4 21 14 20.6 14 20V16H10V20C10 20.6 9.6 21 9 21H8C7.4 21 7 20.6 7 20V11C8.1 11 9 10.1 9 9V7H3V9C3 10.1 3.9 11 5 11V12C5 12.6 5.4 13 6 13S7 12.6 7 12V11H17V12C17 12.6 17.4 13 18 13S19 12.6 19 12V11C20.1 11 21 10.1 21 9Z"/>
                  <circle cx="6" cy="4" r="2"/>
                  <circle cx="18" cy="4" r="2"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Coach Management</h3>
              <p className="text-gray-600 mb-4">Organize coach profiles, specializations, schedules, and assign them to appropriate classes efficiently.</p>
              <Link href="/coaches" className="text-blue-600 font-medium hover:text-blue-700">
                Manage Coaches →
              </Link>
            </div>

            {/* Class Scheduling */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                {/* Badminton Court Icon */}
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="6" cy="8" r="1" fill="currentColor"/>
                  <circle cx="18" cy="16" r="1" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Class Scheduling</h3>
              <p className="text-gray-600 mb-4">Create and manage class schedules, assign courts, and coordinate training sessions with automated reminders.</p>
              <Link href="/classes" className="text-blue-600 font-medium hover:text-blue-700">
                Schedule Classes →
              </Link>
            </div>

            {/* Payment Management */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                {/* Payment/Trophy Icon */}
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  <path d="M8 21V19H16V21H8Z"/>
                  <path d="M6 19V17H18V19H6Z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Management</h3>
              <p className="text-gray-600 mb-4">Automate fee collection, send payment reminders, and track financial records with integrated payment gateways.</p>
              <span className="text-gray-400 font-medium">Coming Soon</span>
            </div>

            {/* Communication */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                {/* Badminton Shuttlecock Communication Icon */}
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="12" rx="3" ry="4" fill="currentColor"/>
                  <path d="M9 8L6 4M12 8L12 4M15 8L18 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="8" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="16" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <path d="M8 16C8 16 10 14 12 14C14 14 16 16 16 16" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Communication Hub</h3>
              <p className="text-gray-600 mb-4">Send notifications via WhatsApp, email, and app. Share updates, announcements, and engage with your community.</p>
              <span className="text-gray-400 font-medium">Coming Soon</span>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                {/* Performance Analytics Icon */}
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3V21H21V19H5V3H3Z"/>
                  <path d="M7 17L11 13L15 17L21 11V13L15 19L11 15L7 19V17Z"/>
                  <circle cx="11" cy="13" r="1"/>
                  <circle cx="15" cy="17" r="1"/>
                  <circle cx="19" cy="9" r="1"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reports & Analytics</h3>
              <p className="text-gray-600 mb-4">Generate comprehensive reports on attendance, performance, revenue, and academy growth metrics.</p>
              <span className="text-gray-400 font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by Academy Owners
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our customers say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "From the time I have subscribed to their services 2 years ago, administration of my academy has become a cake walk. It not only helps me keep a track of each student's attendance, fee and performance, but also helps me upload videos and notes meant for their eyes only."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Rajesh Kumar</p>
                  <p className="text-gray-600 text-sm">Badminton Academy Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "When it comes to a management app for academy operations, this is my #1 go-to app. It helps to mark the attendance and notifies the absentees. Creating performance reports using this app is much easier and quicker."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  P
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Priya Sharma</p>
                  <p className="text-gray-600 text-sm">Sports Academy Director</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                "One stop solution for my Sports Academy. Since we started using the app, we no longer need excel sheets, pen or paper. We have real time info at our fingertips. It helps in effectively managing & strategizing."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Amit Patel</p>
                  <p className="text-gray-600 text-sm">Academy Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your academy?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join hundreds of academy owners who have streamlined their operations
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={openFreeTrialForm}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 font-semibold text-lg cursor-pointer"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => alert("Demo scheduling is coming soon! Please check back later.")}
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 font-semibold text-lg cursor-pointer"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold">Badminton Academy Management System</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional badminton academy management system designed to streamline operations and enhance student experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><span className="text-gray-500">API (Coming Soon)</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Elite Shuttle Badminton Academy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}