import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAnimeDetails, getAnimeEpisodes, getStreamingLinks, getAnimeRelations } from '../lib/api';
import { useAppStore } from '../store';
import { VideoPlayer } from '../components/VideoPlayer';
import { ArrowLeft, Play, List, AlertCircle, ChevronRight, Layers } from 'lucide-react';
import { cn, getBreadcrumbSchema } from '../lib/utils';

export function Watch() {
  const { id, episode } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [streamData, setStreamData] = useState<any>(null);
  const [currentServer, setCurrentServer] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const epNumber = parseInt(episode || '1');
  const { addToHistory } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      setStreamData(null);
      setCurrentServer(0);
      try {
        const detailsData = await getAnimeDetails(id);
        
        setAnime(detailsData);
        setEpisodes(detailsData.episodes || []);
        
        // Add to history
        addToHistory({
          id: detailsData.id,
          mal_id: detailsData.id,
          title: detailsData.title,
          img: detailsData.img
        }, epNumber);

        // Fetch streaming link
        const stream = await getStreamingLinks(id, epNumber, detailsData.title);
        
        if (!stream || !stream.sources || stream.sources.length === 0) {
          setError("No video stream found for this episode.");
        } else {
          setStreamData(stream);
        }

      } catch (err) {
        console.warn("Failed to fetch watch data", err);
        setError("Failed to load video stream. The server might be unavailable.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [id, epNumber]);

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) return <div className="p-8 text-center text-gray-500 font-bold italic tracking-widest uppercase">Anime data not found.</div>;

  const displayEpisodes = episodes?.length > 0 
    ? episodes 
    : [];

  const hasNextEpisode = epNumber < (displayEpisodes.length || 0);

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      const nextEp = episodes.find(e => e.number === epNumber + 1);
      if (nextEp) {
        navigate(`/watch/${id}/${epNumber + 1}`);
      } else if (episodes[epNumber]) {
        navigate(`/watch/${id}/${epNumber + 1}`);
      }
    }
  };

  const handleDownload = () => {
    if (streamData?.download) {
      window.open(streamData.download, '_blank');
    }
  };

  const activeSource = streamData?.sources?.[currentServer];

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      <Helmet>
        <title>{`Watch ${anime.title} Episode ${epNumber} | AnimeHub+`}</title>
        <meta name="description" content={`Watch ${anime.title} Episode ${epNumber} online in high quality for free on AnimeHub+. Stream anime seamlessly without ads.`} />
        <link rel="canonical" href={`https://animehubplus.netlify.app/watch/${anime.id}/${epNumber}`} />
        <meta property="og:title" content={`Watch ${anime.title} Episode ${epNumber} | AnimeHub+`} />
        <meta property="og:description" content={`Watch ${anime.title} Episode ${epNumber} online in high quality for free on AnimeHub+.`} />
        <meta property="og:image" content={anime.img} />
        <meta property="og:type" content="video.episode" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVEpisode",
            "name": `${anime.title} Episode ${epNumber}`,
            "episodeNumber": epNumber,
            "partOfSeries": {
              "@type": "TVSeries",
              "name": anime.title
            },
            "image": anime.img,
            "description": `Watch ${anime.title} Episode ${epNumber} in high quality on AnimeHub+.`
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: 'Search', item: '/search' },
            { name: anime.title, item: `/anime/${anime.id}` },
            { name: `Episode ${epNumber}`, item: `/watch/${anime.id}/${epNumber}` }
          ]))}
        </script>
      </Helmet>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Link to={`/anime/${anime.id}`} className="inline-flex items-center gap-3 text-gray-500 hover:text-indigo-400 transition-all w-fit group">
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Back to Details</span>
        </Link>
        <div className="sm:text-right">
          <h1 className="font-[Outfit] font-bold text-2xl md:text-3xl tracking-tight text-white line-clamp-1">{anime.title}</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-500">Episode {epNumber}</p>
        </div>
      </div>

      <div className="mb-6 relative z-10 w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#0b0b12] border border-white/5 group">
        {error ? (
          <div className="aspect-video flex flex-col items-center justify-center bg-[#0b0b12] p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-600 mb-6" />
            <p className="text-2xl font-bold uppercase text-white tracking-widest mb-2">Video Unavailable</p>
            <p className="text-gray-500 mb-8 max-w-md text-sm font-medium leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
            >
              Reload Player
            </button>
          </div>
        ) : activeSource ? (
          <>
            <div 
              key={`${id}-${epNumber}-${currentServer}`}
              className="w-full h-full"
            >
              <VideoPlayer 
                url={activeSource.url} 
                poster={anime.img} 
                onDownload={streamData?.download ? handleDownload : undefined}
              />
            </div>
            <div className="absolute bottom-16 right-4 sm:right-10 z-30 flex flex-col gap-3 scale-90 sm:scale-100 items-end pointer-events-none">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const video = document.querySelector('video');
                  if (video) video.currentTime += 85;
                }}
                className="bg-black/60 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all border border-white/10 text-xs uppercase tracking-widest hover:bg-black/80 pointer-events-auto"
              >
                Skip Intro
              </button>
              {hasNextEpisode && (
                <button
                  onClick={handleNextEpisode}
                  className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all shadow-2xl text-sm uppercase tracking-widest hover:bg-indigo-500 shadow-indigo-600/20 pointer-events-auto"
                >
                  Next Episode <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-[#0b0b12]">
            <div className="text-center p-8">
              <Play className="w-16 h-16 text-indigo-500/20 mx-auto mb-6 animate-pulse" />
              <p className="text-indigo-500/60 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Video Stream...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-5 mb-14">
        {streamData?.sources && streamData.sources.length > 1 && (
          <div className="flex flex-wrap gap-2 flex-1">
            {streamData.sources.map((s: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentServer(idx)}
                className={`px-6 py-3 rounded-2xl text-[11px] uppercase font-bold tracking-widest transition-all border ${
                  currentServer === idx 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.name || `Server 0${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {hasNextEpisode && (
          <button
            onClick={handleNextEpisode}
            className="flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-10 py-3.5 rounded-2xl font-bold transition-all border border-indigo-500/20 text-xs uppercase tracking-widest shrink-0"
          >
            Watch Next Episode <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-[#16161f] rounded-[2.5rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden group">
            <h2 className="text-2xl font-[Outfit] font-bold mb-8 tracking-tight text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Synopsis
            </h2>
            <p className="text-gray-400 leading-relaxed font-medium text-base md:text-lg">
              {anime.synopsis}
            </p>
          </div>
        </div>

        <div className="order-first lg:order-last">
          <div className="flex items-center gap-3 mb-8 px-4">
            <List className="w-6 h-6 text-indigo-500" />
            <h3 className="font-[Outfit] font-bold text-2xl text-white tracking-tight uppercase tracking-widest">Episodes</h3>
          </div>
          
          <div className="bg-[#16161f] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[500px] lg:h-[750px] shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {displayEpisodes.map((ep: any, index: number) => {
                const epIndex = ep.number || index + 1;
                const isActive = epIndex === epNumber;
                
                return (
                  <Link
                    key={index}
                    to={`/watch/${anime.id}/${epIndex}`}
                    className={`flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 border ${
                      isActive 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                        : 'hover:bg-white/5 border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 text-gray-500'
                    }`}>
                      {isActive ? <Play className="w-5 h-5 fill-current ml-0.5" /> : (epIndex < 10 ? `0${epIndex}` : epIndex)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-widest line-clamp-1 ${isActive ? 'text-white' : ''}`}>
                        Episode {epIndex}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
