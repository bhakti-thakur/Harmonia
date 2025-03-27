'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPlaylists, deletePlaylist, getLikedSongs } from '@/lib/firebaseService';
import { Playlist, Song } from '@/lib/firebaseService';
import useStore from '@/store/useStore';
import { TrashIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Library() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setPlaylist, likedSongs, setLikedSongs } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [userPlaylists, userLikedSongs] = await Promise.all([
          getUserPlaylists(user.uid),
          getLikedSongs(user.uid)
        ]);
        
        setPlaylists(userPlaylists);
        setLikedSongs(userLikedSongs);
      } catch (error) {
        console.error('Error fetching library data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setLikedSongs]);

  const handlePlaySong = (song: Song, allSongs: Song[]) => {
    setCurrentSong(song);
    setPlaylist(allSongs);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    setPlaylist(playlist.songs);
    if (playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0]);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!user) return;
    
    try {
      await deletePlaylist(playlistId);
      setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Please sign in to view your library.
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
    <div className="space-y-8 pb-20">
      {/* Liked Songs Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <HeartIcon className="h-8 w-8 text-red-500 mr-2" />
          Liked Songs
        </h2>
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {likedSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song, likedSongs)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative aspect-square">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <div className="p-2 bg-blue-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
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
                    </div>
                  </div>
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
      </section>

      {/* Created Playlists Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Playlists
          </h2>
          <button
            onClick={() => {
              // TODO: Implement create playlist modal
              console.log('Create playlist clicked');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Playlist
          </button>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square">
                  <img
                    src={playlist.thumbnail || playlist.songs[0]?.thumbnail}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePlayPlaylist(playlist)}
                      className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
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
                  <button
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {playlist.songs.length} songs
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            You haven't created any playlists yet.
          </div>
        )}
      </section>
    </div>
  );
} 