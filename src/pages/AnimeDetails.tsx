import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAnimeDetails, getAnimeEpisodes, getAnimeRelations, getAnimeRecommendations } from '../lib/api';
import { useAppStore } from '../store';
import { Play, Heart, Star, Calendar, Clock, BookOpen, Share2, Layers, Sparkles } from 'lucide-react';
import { cn, formatScore, formatYear, getBreadcrumbSchema } from '../lib/utils';

export function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isFavorite, addFavorite, removeFavorite, history } = useAppStore();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const detailsData = await getAnimeDetails(id);
        const [relationsData, recommendationsData] = await Promise.all([
          getAnimeRelations(id),
          getAnimeRecommendations(id)
        ]);
        setAnime(detailsData);
        setEpisodes(detailsData.episodes || []);
        setRelations(relationsData || []);
        setRecommendations(recommendationsData || []);
      } catch (error) {
        console.warn("Failed to fetch details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) return <div className="p-8 text-center font-bold text-gray-500 italic">Anime not found.</div>;

  const isFav = isFavorite(anime.id);
  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(anime.id);
    } else {
      addFavorite({
        mal_id: anime.id,
        id: anime.id,
        title: anime.title,
        images: { webp: { large_image_url: anime.img } },
        img: anime.img
      });
    }
  };

  const watchHistory = history.find(h => h.animeId === String(anime.id));
  const continueEpisode = watchHistory?.lastEpisode || 1;

  // We ensure there's at least dummy episodes if none returned
  const displayEpisodes = episodes?.length > 0 
    ? episodes 
    : [];

  return (
    <div className="pb-16 max-w-[1400px] mx-auto">
      <Helmet>
        <title>{`${anime.title} | Watch on AnimeHub+`}</title>
        <meta name="description" content={anime.synopsis ? anime.synopsis.slice(0, 160) + '...' : `Watch ${anime.title} online for free on AnimeHub+.`} />
        <link rel="canonical" href={`https://animehubplus.netlify.app/anime/${anime.id}`} />
        <meta property="og:title" content={`${anime.title} | Watch on AnimeHub+`} />
        <meta property="og:description" content={anime.synopsis ? anime.synopsis.slice(0, 160) + '...' : `Watch ${anime.title} online for free.`} />
        <meta property="og:image" content={anime.img} />
        <meta property="og:type" content="video.tv_show" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": anime.title,
            "image": anime.img,
            "description": anime.synopsis?.slice(0, 300),
            "genre": (anime.genres || []).map((g: any) => typeof g === 'string' ? g : g.name),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": anime.score || '8.5',
              "bestRating": "10",
              "worstRating": "1"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: 'Search', item: '/search' },
            { name: anime.title, item: `/anime/${anime.id}` }
          ]))}
        </script>
      </Helmet>
      
      {/* Dynamic Header Structure */}
      <div className="relative w-full h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden border border-white/5 bg-[#0b0b12] mb-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <img 
          src={anime.img} 
          alt={anime.title}
          className="w-full h-full object-cover opacity-20 blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] via-[#0b0b12]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b12] via-[#0b0b12]/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 pb-12 flex flex-col md:flex-row gap-10 items-center md:items-end z-10 h-full overflow-hidden">
          <div className="w-36 md:w-64 shrink-0 z-20 aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 hidden sm:block">
            <img 
              src={anime.img} 
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left z-20">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
              <span className="bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Full HD 1080p</span>
              {anime.genres?.map((g: any) => {
                const gName = typeof g === 'string' ? g : g.name;
                return (
                  <span key={gName} className="bg-white/5 text-gray-300 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full border border-white/10 uppercase">
                    {gName}
                  </span>
                );
              })}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-8xl font-[Outfit] font-bold text-white mb-6 tracking-tighter drop-shadow-2xl leading-[0.9]">
              {anime.title}
            </h1>
            
            {anime.otherNames && (
              <p className="text-gray-500 text-sm md:text-base font-semibold mb-8 line-clamp-1 italic tracking-wide">
                {anime.otherNames}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6 text-sm text-gray-400 font-bold mb-10">
              <div className="flex items-center gap-2 text-indigo-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-white text-lg">{formatScore(anime.score, String(anime.id))}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="tracking-wide">{formatYear(anime.released)}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <Layers className="w-5 h-5 text-gray-500" />
                <span className="tracking-wide">{anime.episodes?.length || anime.totalEpisodes || '?'} Episodes</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-8">
              <Link 
                to={`/watch/${anime.id}/${continueEpisode}`}
                className="flex items-center gap-3 bg-indigo-600 text-white px-10 md:px-14 py-4 md:py-5 rounded-2xl font-bold hover:bg-indigo-500 hover:-translate-y-1 transition-all duration-300 shadow-[0_20px_40px_rgba(79,70,229,0.3)] shrink-0 text-base"
              >
                <Play className="w-6 h-6 fill-current" />
                {watchHistory ? `Resume at Ep ${continueEpisode}` : 'Start Watching'}
              </Link>
              
              <button 
                onClick={toggleFavorite}
                className={cn(
                  "p-4 md:p-5 rounded-2xl transition-all duration-300 border shrink-0",
                  isFav 
                    ? "bg-indigo-600/10 text-indigo-500 border-indigo-500/30" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md"
                )}
              >
                <Heart className={cn("w-6 h-6", isFav && "fill-current scale-110")} />
              </button>
              
              <button className="p-4 md:p-5 rounded-2xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-md shrink-0">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-14 px-4">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-[#16161f] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group">
            <h2 className="text-2xl font-[Outfit] font-bold text-white mb-8 tracking-tight uppercase tracking-widest flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Synopsis
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-6 font-medium text-base md:text-lg">
              {anime.synopsis?.split('\\n\\n').map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-[Outfit] font-bold text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Episodes
              </h2>
              <span className="text-indigo-400 text-xs font-bold bg-indigo-600/10 px-5 py-2.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">{displayEpisodes.length} Available</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
              {displayEpisodes.map((ep: any, index: number) => {
                const epIndex = ep.number || index + 1;
                return (
                  <Link
                    key={index}
                    to={`/watch/${anime.id}/${epIndex}`}
                    className="flex justify-between items-center bg-[#16161f] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1a1a25] p-6 rounded-2xl transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                        {epIndex < 10 ? `0${epIndex}` : epIndex}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm tracking-wide">Episode {epIndex}</h4>
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-gray-600 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 fill-current" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
             <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl md:text-2xl font-[Outfit] font-bold text-white uppercase tracking-tight">Stream {anime.title} in Ultra HD</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-400 text-sm leading-relaxed font-medium">
               <div className="space-y-4">
                 <p>
                    Are you ready to watch <span className="text-white">{anime.title}</span> online for free? AnimeHub+ is your premium destination for high-quality streaming. We provide the latest episodes of <span className="text-white">{anime.title}</span> in subbed and dubbed formats as soon as they air. Our advanced player supports multiple resolutions, allowing you to enjoy every frame in stunning 1080p detail.
                 </p>
                 <p>
                    Whether you are an old fan or a newcomer to <span className="text-white">{anime.title}</span>, our platform offers a seamless viewing experience. We don't just host anime; we provide a community for fans to discover new stories and relive their favorite moments. Start your journey with <span className="text-white">{anime.title}</span> today on AnimeHub+.
                 </p>
               </div>
               <div className="space-y-4">
                 <p>
                    Why choose AnimeHub+ for <span className="text-white">{anime.title}</span>? We prioritize speed and accessibility. Our global servers ensure that you can stream <span className="text-white">{anime.title}</span> without buffering, no matter where you are. We follow the latest seasonal releases, ensuring our library is always up-to-date with the series you love.
                 </p>
                 <p>
                    In addition to <span className="text-white">{anime.title}</span>, explore our massive database of over 10,000 anime series and movies. From top-rated masterpieces to hidden gems, AnimeHub+ is the only anime streaming hub you'll ever need. Watch <span className="text-white">{anime.title}</span> and more for free, 24/7.
                 </p>
               </div>
             </div>
          </section>

          {/* Recommendations */}
          {recommendations.length > 0 && (
             <section>
              <h2 className="text-2xl font-[Outfit] font-bold text-white tracking-tight mb-10 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                You Might Also Like
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-6 px-1 custom-scrollbar no-scrollbar">
                {recommendations.slice(0, 10).map((rec: any) => (
                  <Link
                    key={rec.id}
                    to={`/anime/${rec.id}`}
                    className="shrink-0 w-44 md:w-56 group"
                  >
                    <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-5 border border-white/5 group-hover:border-indigo-500/50 shadow-xl transition-all duration-500">
                      <img 
                        src={rec.img} 
                        alt={rec.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{rec.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-[#16161f] rounded-[2.5rem] p-10 border border-white/5 space-y-10 shadow-2xl sticky top-28">
            <h3 className="font-[Outfit] font-bold text-xl text-white border-b border-white/10 pb-6 tracking-widest uppercase flex items-center gap-3">
              <Layers className="w-6 h-6 text-indigo-500" />
              Information
            </h3>
            
            <div className="space-y-6 text-sm font-semibold">
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Type</span>
                <span className="text-white uppercase">{anime.type || 'TV'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Status</span>
                <span className="text-indigo-400 uppercase">{anime.status || 'Finished'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Released</span>
                <span className="text-white uppercase">{formatYear(anime.released)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Aired</span>
                <span className="text-white uppercase">{formatYear(anime.aired || anime.year)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
