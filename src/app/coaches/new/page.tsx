'use client';

import CoachForm from '@/components/CoachForm';

export default function NewCoachPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Coach</h1>
      <CoachForm />
    </div>
  );
}