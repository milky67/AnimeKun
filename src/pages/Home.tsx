import { useEffect, useState } from 'react';
import { getTopAnime, getRecentEpisodes, getGenres, getTopMovies, getTopRatedAnime, getAnimeDetails } from '../lib/api';
import { AnimeCard } from '../components/AnimeCard';
import { Flame, Clock, Play, History, ChevronRight, LayoutGrid, Sparkles, Star, Film, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Helmet } from 'react-helmet-async';
import { getBreadcrumbSchema } from '../lib/utils';

export function Home() {
  const [topAnime, setTopAnime] = useState<any[]>([]);
  const [recentAnime, setRecentAnime] = useState<any[]>([]);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [heroAnime, setHeroAnime] = useState<any>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { history } = useAppStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [top, recent, genreData, movies, rated] = await Promise.all([
          getTopAnime(),
          getRecentEpisodes(),
          getGenres(),
          getTopMovies(),
          getTopRatedAnime()
        ]);
        
        setTopAnime(top.slice(0, 13));
        setRecentAnime(recent.slice(0, 12));
        setGenres(genreData.slice(0, 12));
        setTopMovies(movies.slice(0, 6));
        setTopRated(rated.slice(0, 6));

        // Fetch rich details for the first top anime for hero section
        if (top[0]) {
          try {
            const details = await getAnimeDetails(top[0].id);
            setHeroAnime(details);
          } catch (e) {
            setHeroAnime(top[0]);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch home data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hero = heroAnime || topAnime[0];

  return (
    <div className="space-y-12 md:space-y-20 pb-24 md:pb-8">
      <Helmet>
        <title>AnimeHub+ | Watch Anime Free Online</title>
        <meta name="description" content="Watch high quality anime online on AnimeHub+ for free. Stream your favorite anime series without ads, latest episodes updated daily." />
        <link rel="canonical" href="https://animehubplus.netlify.app/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AnimeHub+",
            "url": "https://animehubplus.netlify.app/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://animehubplus.netlify.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', item: '/' }
          ]))}
        </script>
      </Helmet>
      {/* Hero Section */}
      {hero && (
        <section className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden mb-12 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5 bg-[#0b0b12]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b12] via-[#0b0b12]/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0">
             <img 
               src={hero.img || 'https://via.placeholder.com/1920x1080?text=No+Image'} 
               alt={hero.title}
               fetchPriority="high"
               className="w-full h-full object-cover object-top opacity-70 transform transition-transform duration-[25s] group-hover:scale-110"
             />
          </div>
          
          <div className="absolute inset-0 p-6 md:p-16 z-20 flex flex-col justify-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="bg-indigo-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full tracking-wide">PREMIUM HD</span>
                <span className="bg-white/10 text-white text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 tracking-wide">#1 Trending</span>
                {hero.genres?.[0] && <span className="text-gray-400 text-xs md:text-sm font-medium tracking-wide">• {typeof hero.genres[0] === 'string' ? hero.genres[0] : hero.genres[0].name}</span>}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-[Outfit] font-bold mb-6 md:mb-8 tracking-tighter line-clamp-2 text-white leading-[0.95]">
                {hero.title}
              </h1>
              {hero.synopsis && (
                <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 mb-8 md:mb-10 font-medium max-w-2xl leading-relaxed">
                  {hero.synopsis}
                </p>
              )}
              <div className="flex items-center gap-3 md:gap-5">
                <Link 
                  to={`/anime/${hero.id}`}
                  className="flex items-center gap-3 bg-indigo-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-bold hover:bg-indigo-500 hover:shadow-[0_20px_40px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Link>
                <Link 
                  to={`/anime/${hero.id}`}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-bold hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-sm md:text-base text-white"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Quick Selector */}
      <section className="px-2">
        <div className="flex items-center gap-3 mb-8">
          <LayoutGrid className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Top Genres</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
          {genres.map((genre) => (
            <Link
              key={genre.mal_id}
              to={`/search?genre=${genre.mal_id}&name=${encodeURIComponent(genre.name)}`}
              className="shrink-0 bg-[#16161f] border border-white/5 px-6 py-4 rounded-2xl text-sm font-semibold tracking-wide hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-gray-400"
            >
              {genre.name}
            </Link>
          ))}
          <Link 
             to="/search" 
             className="shrink-0 bg-indigo-600 border border-indigo-500 px-6 py-4 rounded-2xl text-sm font-bold tracking-wide text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            All Categories →
          </Link>
        </div>
      </section>

      {/* Continue Watching Section */}
      {history.length > 0 && (
        <section className="px-2">
          <div className="flex items-center gap-3 mb-8">
            <History className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Jump Back In</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 px-1 custom-scrollbar no-scrollbar">
            {history.slice(0, 10).map((item) => (
              <Link 
                key={item.animeId}
                to={`/watch/${item.animeId}/${item.lastEpisode}`}
                className="shrink-0 w-64 md:w-80 bg-[#16161f] border border-white/5 rounded-3xl overflow-hidden hover:border-indigo-500/30 hover:bg-[#1a1a25] shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
                  <img 
                    src={item.image || 'https://via.placeholder.com/640x360?text=No+Image'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                    <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-white text-white ml-1.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                    <div className="h-full bg-indigo-600 w-[70%] rounded-r-full" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-[Outfit] font-bold text-base line-clamp-1 group-hover:text-indigo-400 transition-colors text-white">{item.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Episode {item.lastEpisode}</p>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Trending Now</h2>
          </div>
          <Link to="/search?type=trending" className="text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {topAnime.slice(1).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* Top Movies Section */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="w-7 h-7 text-pink-500" />
            <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Top Movies</h2>
          </div>
          <Link to="/search?type=movie" className="text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {topMovies.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Top Rated</h2>
          </div>
          <Link to="/search?type=toprated" className="text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {topRated.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="px-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 text-indigo-400" />
            <h2 className="text-2xl md:text-3xl font-[Outfit] font-bold tracking-tight text-white uppercase tracking-wider">Recently Updated</h2>
          </div>
          <Link to="/search?type=seasonal" className="text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {recentAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* SEO Description Section */}
      <section className="px-4 py-20 border-t border-white/5 bg-white/[0.02] rounded-[3rem]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-[Outfit] font-bold text-white tracking-tighter uppercase">The #1 Platform to Watch Anime Free</h2>
            <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">Your Library of Infinite Stories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-400 font-medium leading-relaxed">
            <div className="space-y-6">
              <h3 className="text-white font-bold text-xl uppercase tracking-wider border-b border-white/10 pb-4">Streaming Made Easy</h3>
              <p>
                AnimeHub+ is dedicated to providing fans worldwide with the best possible anime watching experience. Our mission is to make high-quality Japanese animation accessible to everyone, regardless of location or budget. With thousands of titles ranging from the latest seasonal hits to timeless classics, you'll never run out of things to watch.
              </p>
              <p>
                Our server infrastructure is optimized for speed, offering low buffering times even during peak hours. Whether you're watching on your desktop, tablet, or smartphone, our responsive design ensures a premium experience. We support multiple languages and offer both subbed and dubbed versions for most of our library.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-white font-bold text-xl uppercase tracking-wider border-b border-white/10 pb-4">Features for Fans</h3>
              <p>
                We believe that watching anime should be personal. That's why we've built tools like the custom Watchlist, allowing you to save series and movies for later. Our intelligent recommendation engine learns from your viewing history to suggest new shows you're guaranteed to love.
              </p>
              <p>
                Join our community of over 1 million active users and stay updated with the latest news from the anime world. We follow strict quality standards for our video encodes, providing 1080p Ultra HD content for the majority of our platform. Start your journey into the world of anime today with AnimeHub+.
              </p>
            </div>
          </div>

          <div className="pt-20 space-y-12">
             <div className="text-center">
                <h3 className="text-2xl font-[Outfit] font-bold text-white uppercase tracking-tight">Frequently Asked Questions</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Everything You Need to Know</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { q: "Is AnimeHub+ really free?", a: "Yes, AnimeHub+ is a completely free platform. Users can stream our entire library of anime series and movies without paying any subscription fees." },
                  { q: "Do I need an account to watch anime?", a: "No account is required to start watching. However, creating a free account allows you to save favorites and track your watch history across devices." },
                  { q: "How often do you update with new episodes?", a: "We update our database within minutes of the original broadcast in Japan. Both subbed and dubbed versions are added as soon as they become available." },
                  { q: "What video quality do you support?", a: "Most of our anime content is available in multiple resolutions, ranging from 360p for low data usage to 1080p Ultra HD for the best visual experience." },
                  { q: "Is there a mobile app for AnimeHub+?", a: "Our website is fully optimized for mobile devices. You can even 'Add to Home Screen' to use it like a Progressive Web App (PWA) with a dedicated icon." },
                  { q: "Can I download anime for offline viewing?", a: "While we specialize in high-speed streaming, many of our episodes including popular shows like One Piece and Naruto can be cached for smoother playback." }
                ].map((faq, index) => (
                  <div key={index} className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl space-y-4 hover:bg-white/[0.05] transition-colors group">
                    <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-wider flex gap-4">
                      <span className="text-white/20 group-hover:text-indigo-500/50 transition-colors">0{index + 1}</span>
                      {faq.q}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="pt-10 space-y-6">
             <h4 className="text-center text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-8">Popular Searches</h4>
             <div className="flex flex-wrap justify-center gap-3">
              {['Free Anime Online', 'Watch One Piece Free', 'Demon Slayer Season 4', 'Solo Leveling HD', 'Jujutsu Kaisen Streaming', 'Attack on Titan Final Season', 'Watch Naruto Shippuden', 'Bleach Thousand Year Blood War'].map(tag => (
                <span key={tag} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
