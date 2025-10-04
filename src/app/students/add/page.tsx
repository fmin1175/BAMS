'use client';

import { useState } from 'react';
import StudentForm from '@/components/StudentForm';
import Link from 'next/link';

export default function AddStudentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Student</h1>
        <Link 
          href="/students"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          Back to Students
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <StudentForm />
      </div>
    </div>
  );
}