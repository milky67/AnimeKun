import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAnime } from '../lib/api';
import { AnimeCard } from '../components/AnimeCard';
import { formatScore, formatYear, getBreadcrumbSchema } from '../lib/utils';
import { Search as SearchIcon, Ghost, LayoutGrid, List, Play } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const genreId = searchParams.get('genre') || '';
  const genreName = searchParams.get('name') || '';
  const type = searchParams.get('type') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchResults = async () => {
      // If nothing is selected, don't just clear, maybe show general browse if user wants
      if (!query && !genreId && !type) {
        setIsLoading(true);
        const data = await searchAnime('', 1);
        setResults(data);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchAnime(query, 1, genreName, type);
        setResults(data);
      } catch (error) {
        console.warn("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [query, genreId, type]);

  const setType = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    if (!newType) params.delete('type');
    else params.set('type', newType);
    setSearchParams(params);
  };

  return (
    <div className="pb-24 md:pb-8">
      <Helmet>
        <title>{query ? `Searching for "${query}" | AnimeHub+` : genreName ? `${genreName} Anime | AnimeHub+` : 'Browse Anime | AnimeHub+'}</title>
        <meta name="description" content={query ? `Search results for "${query}" on AnimeHub+. Find your favorite anime series.` : `Explore the best ${genreName || ''} anime on AnimeHub+. free high quality streaming.`} />
        <link rel="canonical" href={`https://animehubplus.netlify.app/search${window.location.search}`} />
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: 'Search', item: '/search' }
          ]))}
        </script>
      </Helmet>
      {/* Mobile search input */}
      <div className="md:hidden relative mb-8">
         <div className="relative flex items-center group w-full bg-[#16161f] border border-white/5 px-6 py-4 rounded-2xl backdrop-blur-md transition-all focus-within:border-indigo-500/50 shadow-xl">
           <SearchIcon className="w-5 h-5 text-indigo-500 group-focus-within:text-white mr-3 shrink-0" />
           <input
              type="text"
              placeholder="Search anime series..."
              value={query}
              onChange={(e) => setSearchParams({ q: e.target.value, genre: genreId, name: genreName, type: type })}
              className="bg-transparent outline-none w-full placeholder:text-gray-600 text-white font-bold uppercase tracking-tight"
            />
         </div>
      </div>

      <div className="mb-8 px-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-2xl md:text-4xl font-[Outfit] font-bold tracking-tight text-white flex-1 uppercase tracking-wider">
          {genreId ? (
            <span className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
              Genre: <span className="text-indigo-400">"{genreName}"</span>
            </span>
          ) : query ? (
            <span className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
              Search: <span className="text-indigo-400">"{query}"</span>
            </span>
          ) : type ? (
            <span className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
              Category: <span className="text-indigo-400 capitalize">"{type}"</span>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
              Browse All
            </span>
          )}
        </h1>

        <div className="flex items-center bg-[#16161f] p-2 rounded-2xl self-start md:self-auto border border-white/5 shadow-2xl">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-10 px-2 custom-scrollbar no-scrollbar">
        {[
          { label: 'All', value: '' },
          { label: 'Trending', value: 'trending' },
          { label: 'Movies', value: 'movie' },
          { label: 'Seasonal', value: 'seasonal' },
          { label: 'Top Rated', value: 'toprated' },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setType(btn.value)}
            className={`shrink-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
              type === btn.value 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((anime) => (
              <Link 
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="flex items-center gap-6 bg-[#16161f] border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 hover:bg-[#1a1a25] transition-all group shadow-sm hover:shadow-2xl"
              >
                <div className="w-24 h-36 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                  <img 
                    src={anime.img} 
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-[Outfit] font-bold text-lg md:text-2xl tracking-tight truncate text-white group-hover:text-indigo-400 transition-colors uppercase">
                    {anime.title}
                  </h3>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {Array.isArray(anime.genres) && anime.genres?.slice(0, 3).map((g: any) => {
                      const gName = typeof g === 'string' ? g : g.name;
                      return (
                        <span key={gName} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{gName}</span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">★ {formatScore(anime.score, anime.id)}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{formatYear(anime.released)}</span>
                    <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">{anime.type}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full border border-white/10 bg-white/5 group-hover:border-indigo-600 group-hover:bg-indigo-600 shadow-sm group-hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all mr-6">
                   <Play className="w-6 h-6 text-gray-400 group-hover:text-white fill-current ml-1" />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : query ? (
        <div className="text-center py-32 bg-[#16161f] rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
           <Ghost className="w-20 h-20 mx-auto mb-8 text-gray-700" />
           <p className="text-2xl font-[Outfit] text-white font-bold uppercase tracking-widest">No results found</p>
           <p className="mt-2 text-gray-500 font-bold text-xs uppercase tracking-widest">We couldn't find any anime for "{query}"</p>
        </div>
      ) : (
        <div className="text-center py-32 bg-[#16161f] rounded-[3rem] border border-white/5 shadow-2xl">
          <SearchIcon className="w-24 h-24 mx-auto mb-8 text-indigo-600/10" />
          <p className="text-2xl font-[Outfit] font-bold text-white uppercase tracking-widest">Find Your Next Story</p>
          <p className="mt-2 text-gray-500 font-bold text-xs uppercase tracking-widest">Search through thousands of anime titles.</p>
        </div>
      )}
      {/* SEO Description Section */}
      <section className="mt-24 px-4 py-16 border-t border-white/5 bg-white/[0.02] rounded-[3rem]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-[Outfit] font-bold text-white tracking-tight uppercase">Explore Thousands of Anime Series</h2>
            <p className="mt-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Your Library of Infinite Adventures</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-400 text-sm leading-relaxed font-medium">
            <div className="space-y-4">
              <h3 className="text-white font-bold uppercase tracking-wider">Advanced Anime Search</h3>
              <p>
                Find your favorite anime series effortlessly using our powerful search and filtering system. Whether you are looking for the latest seasonal releases or classic masterpieces, AnimeHub+ gives you the tools to discover exactly what you crave. Filter by genres like Action, Romance, Horror, or Fantasy to narrow down your choices.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-bold uppercase tracking-wider">Trending & Top Rated</h3>
              <p>
                Stay ahead of the curve with our trending and top-rated sections. We track what's popular in the anime community so you never miss a hit. Our library is updated in real-time, ensuring you have access to the latest episodes as soon as they are available. Join millions of fans and start streaming in high definition today.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
