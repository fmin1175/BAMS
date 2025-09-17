import Link from 'next/link';
import PlayerList from '@/components/PlayerList';

export default function PlayersPage() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900">Players</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all players in your academy.</p>
        </div>
        <Link 
          href="/players/new" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Player
        </Link>
      </div>
      <div className="border-t border-gray-200">
        <PlayerList />
      </div>
    </div>
  );
}