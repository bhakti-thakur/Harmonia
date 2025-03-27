import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import useStore from '@/store/useStore';

const MusicPlayer = () => {
  const playerRef = useRef<ReactPlayer>(null);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const {
    currentSong,
    isPlaying,
    playlist,
    setIsPlaying,
    setCurrentSong,
    likedSongs,
    addLikedSong,
    removeLikedSong,
  } = useStore();

  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
      // Reset player state when song changes
      setPlayed(0);
      setSeeking(false);
      playerRef.current?.seekTo(0);
    }
  }, [currentSong, setIsPlaying]);

  // Add effect to handle playlist end
  useEffect(() => {
    if (played >= 0.99 && !seeking) {
      handleNextSong();
    }
  }, [played, seeking]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.currentTarget.value));
  };

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 1 : 0);
  };

  const handleNextSong = () => {
    if (playlist.length > 0 && currentSong) {
      const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
      const nextSong = playlist[(currentIndex + 1) % playlist.length];
      setCurrentSong(nextSong);
    }
  };

  const handlePreviousSong = () => {
    if (playlist.length > 0 && currentSong) {
      const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
      const previousSong = playlist[(currentIndex - 1 + playlist.length) % playlist.length];
      setCurrentSong(previousSong);
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const isLiked = currentSong && likedSongs.some((song) => song.id === currentSong.id);

  const toggleLike = () => {
    if (currentSong) {
      if (isLiked) {
        removeLikedSong(currentSong.id);
      } else {
        addLikedSong(currentSong);
      }
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover"
          />
          <div className="max-w-[200px] sm:max-w-none">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentSong.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={toggleLike}
            className={`p-2 rounded-full ${
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 w-full sm:flex-1 sm:max-w-2xl sm:mx-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousSong}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <BackwardIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2 sm:p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
            <button
              onClick={handleNextSong}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ForwardIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="w-full flex items-center space-x-2 text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-8 sm:w-12 text-right">
              {formatTime(duration * played)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-500 dark:text-gray-400 w-8 sm:w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control - Hidden on mobile */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="h-6 w-6" />
            ) : (
              <SpeakerWaveIcon className="h-6 w-6" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Hidden ReactPlayer */}
        <ReactPlayer
          ref={playerRef}
          url={currentSong.url}
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleNextSong}
          onError={(e) => console.error('Player error:', e)}
          width="0"
          height="0"
          config={{
            youtube: {
              playerVars: { 
                showinfo: 0,
                controls: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default MusicPlayer; 