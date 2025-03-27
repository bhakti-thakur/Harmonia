import { create } from 'zustand';
import { Song, Playlist } from '@/lib/firebaseService';
import { updateLikedSongs } from '@/lib/firebaseService';

interface StoreState {
  // Auth State
  user: any;
  setUser: (user: any) => void;

  // Player State
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  playlist: Song[];
  currentPlaylistId: string | null;
  
  // Player Actions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (state: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (songs: Song[]) => void;
  setCurrentPlaylistId: (id: string | null) => void;

  // User Data
  likedSongs: Song[];
  playlists: Playlist[];
  
  // User Actions
  setLikedSongs: (songs: Song[]) => void;
  addLikedSong: (song: Song) => void;
  removeLikedSong: (songId: string) => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const useStore = create<StoreState>((set, get) => ({
  // Auth State
  user: null,
  setUser: (user) => set({ user }),

  // Player State
  currentSong: null,
  isPlaying: false,
  volume: 1,
  playlist: [],
  currentPlaylistId: null,

  // Player Actions
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (state) => set({ isPlaying: state }),
  setVolume: (volume) => set({ volume }),
  setPlaylist: (songs) => set({ playlist: songs }),
  setCurrentPlaylistId: (id) => set({ currentPlaylistId: id }),

  // User Data
  likedSongs: [],
  playlists: [],

  // User Actions
  setLikedSongs: (songs) => {
    set({ likedSongs: songs });
    const user = get().user;
    if (user) {
      updateLikedSongs(user.uid, songs);
    }
  },
  addLikedSong: (song) =>
    set((state) => {
      if (state.likedSongs.some(s => s.id === song.id)) {
        return state; // Don't add if already exists
      }
      const newLikedSongs = [...state.likedSongs, song];
      if (state.user) {
        updateLikedSongs(state.user.uid, newLikedSongs);
      }
      return { likedSongs: newLikedSongs };
    }),
  removeLikedSong: (songId) =>
    set((state) => {
      const newLikedSongs = state.likedSongs.filter((song) => song.id !== songId);
      if (state.user) {
        updateLikedSongs(state.user.uid, newLikedSongs);
      }
      return { likedSongs: newLikedSongs };
    }),
  addPlaylist: (playlist) =>
    set((state) => ({ playlists: [...state.playlists, playlist] })),
  removePlaylist: (playlistId) =>
    set((state) => ({
      playlists: state.playlists.filter((playlist) => playlist.id !== playlistId),
    })),
  addSongToPlaylist: (playlistId, song) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      ),
    })),
  removeSongFromPlaylist: (playlistId, songId) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: playlist.songs.filter((song) => song.id !== songId),
            }
          : playlist
      ),
    })),
}));

export default useStore; 