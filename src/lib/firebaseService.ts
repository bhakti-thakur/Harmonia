import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  thumbnail?: string;
  userId: string;
  createdAt: number;
}

// User Profile
export const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: Date.now(),
    });
  }
};

// Liked Songs
export const getLikedSongs = async (userId: string): Promise<Song[]> => {
  const likedSongsRef = doc(db, 'users', userId, 'likedSongs', 'songs');
  const likedSongsSnap = await getDoc(likedSongsRef);
  return likedSongsSnap.exists() ? likedSongsSnap.data().songs : [];
};

export const updateLikedSongs = async (userId: string, songs: Song[]) => {
  const likedSongsRef = doc(db, 'users', userId, 'likedSongs', 'songs');
  await setDoc(likedSongsRef, { songs });
};

// Playlists
export const createPlaylist = async (
  userId: string,
  name: string,
  songs: Song[] = []
): Promise<Playlist> => {
  const playlistsRef = collection(db, 'playlists');
  const playlistRef = doc(playlistsRef);
  
  const playlist: Playlist = {
    id: playlistRef.id,
    name,
    songs,
    userId,
    createdAt: Date.now(),
  };

  await setDoc(playlistRef, playlist);
  return playlist;
};

export const getPlaylist = async (playlistId: string): Promise<Playlist | null> => {
  const playlistRef = doc(db, 'playlists', playlistId);
  const playlistSnap = await getDoc(playlistRef);
  return playlistSnap.exists() ? (playlistSnap.data() as Playlist) : null;
};

export const getUserPlaylists = async (userId: string): Promise<Playlist[]> => {
  const playlistsRef = collection(db, 'playlists');
  const q = query(playlistsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => doc.data() as Playlist);
};

export const updatePlaylist = async (
  playlistId: string,
  updates: Partial<Playlist>
) => {
  const playlistRef = doc(db, 'playlists', playlistId);
  await updateDoc(playlistRef, updates);
};

export const deletePlaylist = async (playlistId: string) => {
  const playlistRef = doc(db, 'playlists', playlistId);
  await deleteDoc(playlistRef);
};

export const addSongToPlaylist = async (playlistId: string, song: Song) => {
  const playlistRef = doc(db, 'playlists', playlistId);
  const playlistSnap = await getDoc(playlistRef);
  
  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data() as Playlist;
    const updatedSongs = [...playlist.songs, song];
    await updateDoc(playlistRef, { songs: updatedSongs });
  }
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
  const playlistRef = doc(db, 'playlists', playlistId);
  const playlistSnap = await getDoc(playlistRef);
  
  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data() as Playlist;
    const updatedSongs = playlist.songs.filter((song) => song.id !== songId);
    await updateDoc(playlistRef, { songs: updatedSongs });
  }
}; 