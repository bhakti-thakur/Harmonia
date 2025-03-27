'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLikedSongs } from '@/lib/firebaseService';
import { Song } from '@/lib/firebaseService';
import useStore from '@/store/useStore';

export default function LikedSongs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setPlaylist, likedSongs, setLikedSongs } = useStore();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user) return;
      
      try {
        const fetchedLikedSongs = await getLikedSongs(user.uid);
        setLikedSongs(fetchedLikedSongs);
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, [user, setLikedSongs]);

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setPlaylist(likedSongs);
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Please sign in to view your liked songs.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Liked Songs
      </h1>

      {likedSongs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {likedSongs.map((song) => (
            <div
              key={song.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handlePlaySong(song)}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          You haven't liked any songs yet.
        </div>
      )}
    </div>
  );
} 