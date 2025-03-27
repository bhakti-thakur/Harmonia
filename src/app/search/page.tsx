'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchSongs, getRegionalMusic } from '@/lib/youtubeService';
import { Song } from '@/lib/firebaseService';
import useStore from '@/store/useStore';

export default function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [songs, setSongs] = useState<Song[]>([]);
  const [bollywoodSongs, setBollywoodSongs] = useState<Song[]>([]);
  const [globalSongs, setGlobalSongs] = useState<Song[]>([]);
  const [maharashtraSongs, setMaharashtraSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong, setPlaylist } = useStore();

  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        // Fetch Bollywood hits
        const bollywoodResults = await getRegionalMusic('bollywood');
        setBollywoodSongs(bollywoodResults);

        // Fetch Global hits
        const globalResults = await getRegionalMusic('global');
        setGlobalSongs(globalResults);

        // Fetch Maharashtra regional songs
        const maharashtraResults = await getRegionalMusic('maharashtra');
        setMaharashtraSongs(maharashtraResults);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchAllSongs();
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!query) {
        setSongs([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchSongs(query);
        setSongs(results);
      } catch (error) {
        console.error('Error searching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [query]);

  const handlePlaySong = (song: Song, playlist: Song[]) => {
    setCurrentSong(song);
    setPlaylist(playlist);
  };

  const renderSongGrid = (songs: Song[], playlist: Song[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {songs.map((song) => (
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
              onClick={() => handlePlaySong(song, playlist)}
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
  );

  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {query ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results for "{query}"
          </h1>

          {loading ? (
            renderLoadingSpinner()
          ) : songs.length > 0 ? (
            renderSongGrid(songs, songs)
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No songs found. Try a different search term.
            </div>
          )}
        </>
      ) : (
        <>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Latest Bollywood Hits
            </h2>
            {bollywoodSongs.length > 0 ? (
              renderSongGrid(bollywoodSongs, bollywoodSongs)
            ) : (
              renderLoadingSpinner()
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Global Trending Hits
            </h2>
            {globalSongs.length > 0 ? (
              renderSongGrid(globalSongs, globalSongs)
            ) : (
              renderLoadingSpinner()
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Maharashtra's Top Songs
            </h2>
            {maharashtraSongs.length > 0 ? (
              renderSongGrid(maharashtraSongs, maharashtraSongs)
            ) : (
              renderLoadingSpinner()
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Latest Bollywood Songs',
                'Global Hits 2024',
                'Marathi Trending',
                'Bollywood Romance',
                'Maharashtra Folk Songs',
                'Bollywood Party Hits'
              ].map((term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {term}
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
} 