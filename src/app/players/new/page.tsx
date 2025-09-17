import PlayerForm from '@/components/PlayerForm';

export default function NewPlayerPage() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Add New Player</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Enter the player details below.</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <PlayerForm />
      </div>
    </div>
  );
}