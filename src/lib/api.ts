import axios from 'axios';

// Cache for results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

async function fetchLocal(url: string, params?: any): Promise<any> {
  const cacheKey = url + JSON.stringify(params || {});
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(url, { params });
    const data = response.data;
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`Local API Error (${url}):`, err);
    throw err;
  }
}

export async function getTopAnime(page = 1) {
  return await fetchLocal('/api/anime/popular', { page });
}

export async function getTopMovies(page = 1) {
  // We don't have a specific movie endpoint yet, we'll just filter popular or use search
  return await fetchLocal('/api/anime/search', { q: 'movie', page });
}

export async function getTopRatedAnime(page = 1) {
  return await fetchLocal('/api/anime/popular', { page });
}

export async function getRecentEpisodes(page = 1) {
  return await fetchLocal('/api/anime/recent', { page });
}

export async function searchAnime(query: string, page = 1, genreId?: string, type?: string) {
  if (type === 'trending' || type === 'popular' || type === 'toprated') {
    return await fetchLocal('/api/anime/popular', { page });
  }
  if (type === 'recent') {
    return await fetchLocal('/api/anime/recent', { page });
  }

  // Check if we have genreId (it holds the genreName based on Home.tsx and Search.tsx logic or search param)
  // Wait, in Search.tsx genreName is string. I will just pass genreId as the genre param.
  return await fetchLocal('/api/anime/search', { q: query || '', page, type, genre: genreId });
}

export async function getAnimeDetails(id: string) {
  return await fetchLocal(`/api/anime/details/${id}`);
}

export async function getAnimeRelations(id: string) {
  // Gogoanime doesn't provide relations easily, we might need to skip or provide simple ones
  return [];
}

export async function getAnimeRecommendations(id: string) {
  // Can just show popular as recommendations for now
  return await fetchLocal('/api/anime/popular', { page: 1 });
}

export async function getGenres() {
  // Static list or scraped
  return [
    { mal_id: 'action', name: 'Action' },
    { mal_id: 'adventure', name: 'Adventure' },
    { mal_id: 'comedy', name: 'Comedy' },
    { mal_id: 'drama', name: 'Drama' },
    { mal_id: 'fantasy', name: 'Fantasy' },
    { mal_id: 'horror', name: 'Horror' },
    { mal_id: 'romance', name: 'Romance' },
    { mal_id: 'sci-fi', name: 'Sci-Fi' },
    { mal_id: 'slice-of-life', name: 'Slice of Life' },
    { mal_id: 'supernatural', name: 'Supernatural' },
  ];
}

export async function getAnimeEpisodes(id: string) {
  const details = await getAnimeDetails(id);
  return details.episodes || [];
}

export async function getStreamingLinks(animeId: string, episodeNumber: number, title: string) {
  try {
    const res = await axios.get(`/api/anime/watch/${animeId}/${episodeNumber}`);
    const results = res.data.servers;

    if (results && results.length > 0) {
      return {
        sources: results.map((s: any) => ({
          url: s.url,
          name: s.name,
          isM3U8: s.url.includes('.m3u8')
        }))
      };
    }
  } catch (err) {
    console.warn("Failed to get local stream links", err);
  }

  return { sources: [] };
}
