import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  XMarkIcon,
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
      className={`
        bg-white dark:bg-gray-800 h-full flex flex-col
        w-[280px] md:w-[240px] lg:w-[280px]
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Logo and close button */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            Harmonia🎵
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-colors duration-150 ease-in-out
                  ${
                    pathname === item.href
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Playlists Section */}
        <div className="mt-8">
          <h3 className="px-6 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Your Playlists
          </h3>
          <ul className="mt-3 px-3 space-y-1">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="truncate">{playlist.name}</span>
                </Link>
              </li>
            ))}
            {playlists.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No playlists yet
              </li>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 