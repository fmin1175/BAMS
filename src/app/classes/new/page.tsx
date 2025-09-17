'use client';

import ClassForm from '@/components/ClassForm';

export default function NewClassPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Class</h1>
      <ClassForm />
    </div>
  );
}