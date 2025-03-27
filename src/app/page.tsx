'use client';

import { useEffect, useState } from 'react';
import { getTrendingPlaylists, getVideoDetails, getPlaylistItems } from '@/lib/youtubeService';
import { Song } from '@/lib/firebaseService';
import useStore from '@/store/useStore';
import type { Playlist } from '@/lib/youtubeService';

export default function Home() {
  const [bollywoodPlaylists, setBollywoodPlaylists] = useState<Playlist[]>([]);
  const [globalPlaylists, setGlobalPlaylists] = useState<Playlist[]>([]);
  const [maharashtraPlaylists, setMaharashtraPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentSong, setPlaylist } = useStore();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setError(null);
        // Fetch all playlists in parallel
        const [bollywoodResults, globalResults, maharashtraResults] = await Promise.all([
          getTrendingPlaylists('bollywood'),
          getTrendingPlaylists('global'),
          getTrendingPlaylists('maharashtra')
        ]);

        setBollywoodPlaylists(bollywoodResults);
        setGlobalPlaylists(globalResults);
        setMaharashtraPlaylists(maharashtraResults);

        // Check if we got any playlists
        if (!bollywoodResults.length && !globalResults.length && !maharashtraResults.length) {
          setError('No playlists found. Please check your internet connection and try again.');
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Failed to load playlists. Please try again later.');
      }
    };

    fetchPlaylists();
  }, []);

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      const songs = await getPlaylistItems(playlistId);
      if (songs.length > 0) {
        setCurrentSong(songs[0]);
        setPlaylist(songs);
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const renderPlaylistGrid = (playlists: Playlist[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          onClick={() => handlePlayPlaylist(playlist.id)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="relative aspect-video">
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handlePlayPlaylist(playlist.id)}
              className="absolute bottom-2 right-2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
              {playlist.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {playlist.channelTitle}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              {playlist.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Trending Bollywood Playlists
        </h2>
        {bollywoodPlaylists.length > 0 ? (
          renderPlaylistGrid(bollywoodPlaylists)
        ) : (
          renderLoadingSpinner()
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Global Music Trends
        </h2>
        {globalPlaylists.length > 0 ? (
          renderPlaylistGrid(globalPlaylists)
        ) : (
          renderLoadingSpinner()
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Maharashtra's Trending Playlists
        </h2>
        {maharashtraPlaylists.length > 0 ? (
          renderPlaylistGrid(maharashtraPlaylists)
        ) : (
          renderLoadingSpinner()
        )}
      </section>
    </div>
  );
}
