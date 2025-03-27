import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import useStore from '@/store/useStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const playlists = useStore((state) => state.playlists);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'Liked Songs', href: '/liked', icon: HeartIcon },
    { name: 'Your Library', href: '/library', icon: ListBulletIcon },
  ];

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-800 h-full transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            {isOpen ? 'Harmonia🎵' : 'H🎵'}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                  pathname === item.href
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Playlists */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Your Playlists
          </h3>
          <ul className="mt-2 space-y-1">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="block px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {playlist.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 