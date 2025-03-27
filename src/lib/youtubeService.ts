import { Song } from './firebaseService';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchResult {
  id: {
    videoId?: string;
    playlistId?: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

interface YouTubePlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
}

interface YouTubeVideoDetails {
  items: Array<{
    contentDetails: {
      duration: string;
    };
  }>;
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  contentDetails: {
    duration: string;
  };
}

const parseDuration: (duration: string) => number = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match?.[1] ? parseInt(match[1]) : 0) * 3600;
  const minutes = (match?.[2] ? parseInt(match[2]) : 0) * 60;
  const seconds = match?.[3] ? parseInt(match[3]) : 0;
  
  return hours + minutes + seconds;
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&maxResults=10&q=${query}&type=video&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items) return [];

    const videoIds = searchData.items.map(
      (item: YouTubeSearchResult) => item.id.videoId
    );

    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoIds.join(
        ','
      )}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData: YouTubeVideoDetails = await detailsResponse.json();

    return searchData.items.map((item: YouTubeSearchResult, index: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(detailsData.items[index].contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

export const getTrendingMusic = async (regionCode?: string): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}${regionCode ? `&regionCode=${regionCode}` : ''}`
    );
    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response from YouTube API:', data);
      return [];
    }

    return data.items.map((item: YouTubeVideoItem) => {
      try {
        return {
          id: item.id,
          title: item.snippet.title || 'Unknown Title',
          artist: item.snippet.channelTitle || 'Unknown Artist',
          thumbnail: item.snippet.thumbnails?.high?.url || '',
          duration: item.contentDetails?.duration ? parseDuration(item.contentDetails.duration) : 0,
          url: `https://www.youtube.com/watch?v=${item.id}`,
        };
      } catch (error) {
        console.error('Error processing video item:', error);
        return null;
      }
    }).filter((item: Song | null): item is Song => item !== null);
  } catch (error) {
    console.error('Error fetching trending music:', error);
    return [];
  }
};

export const getUserRegion = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country;
  } catch (error) {
    console.error('Error fetching user region:', error);
    return 'US'; // Default to US if region detection fails
  }
};

export const getVideoDetails = async (videoId: string): Promise<Song | null> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(item.contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${item.id}`,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

export const getRegionalMusic = async (category: 'bollywood' | 'global' | 'maharashtra'): Promise<Song[]> => {
  try {
    let query = '';
    let regionCode = 'IN';
    
    switch (category) {
      case 'bollywood':
        query = 'latest bollywood songs';
        break;
      case 'global':
        query = 'trending music';
        regionCode = '';  // No region code for global
        break;
      case 'maharashtra':
        query = 'latest marathi songs maharashtra';
        break;
    }

    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&maxResults=20&q=${query}&type=video&videoCategoryId=10${regionCode ? `&regionCode=${regionCode}` : ''}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items) return [];

    const videoIds = searchData.items.map(
      (item: YouTubeSearchResult) => item.id.videoId
    );

    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoIds.join(
        ','
      )}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData: YouTubeVideoDetails = await detailsResponse.json();

    return searchData.items.map((item: YouTubeSearchResult, index: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(detailsData.items[index].contentDetails.duration),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching regional music:', error);
    return [];
  }
};

export const getTrendingPlaylists = async (category: 'bollywood' | 'global' | 'maharashtra'): Promise<Playlist[]> => {
  try {
    let query = '';
    let regionCode = 'IN';
    
    switch (category) {
      case 'bollywood':
        query = 'bollywood hits playlist';
        break;
      case 'global':
        query = 'top hits';
        regionCode = '';
        break;
      case 'maharashtra':
        query = 'marathi hits playlist';
        break;
    }

    console.log(`Fetching ${category} playlists with query: ${query}`);
    
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=playlist&key=${YOUTUBE_API_KEY}${regionCode ? `&regionCode=${regionCode}` : ''}`
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API returned status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items) {
      console.error(`No items returned for ${category} playlists:`, searchData);
      return [];
    }

    console.log(`Found ${searchData.items.length} playlists for ${category}`);

    return searchData.items.map((item: YouTubeSearchResult) => {
      try {
        if (!item.id.playlistId) {
          console.error('Invalid playlist item:', item);
          return null;
        }
        
        return {
          id: item.id.playlistId,
          title: item.snippet.title || 'Untitled Playlist',
          description: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails?.high?.url || '',
          channelTitle: item.snippet.channelTitle || 'Unknown Channel',
        };
      } catch (error) {
        console.error('Error processing playlist item:', error);
        return null;
      }
    }).filter((item: unknown): item is Playlist => item !== null);
  } catch (error) {
    console.error(`Error fetching ${category} playlists:`, error);
    return [];
  }
};

export const getPlaylistItems = async (playlistId: string): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (!data.items) return [];

    const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId);

    // Get video details for duration
    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData = await detailsResponse.json();

    return data.items.map((item: any, index: number) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      artist: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || '',
      duration: detailsData.items[index] ? parseDuration(detailsData.items[index].contentDetails.duration) : 0,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    }));
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    return [];
  }
}; 