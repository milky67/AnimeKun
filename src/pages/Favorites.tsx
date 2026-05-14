import { useAppStore } from '../store';
import { AnimeCard } from '../components/AnimeCard';
import { Link } from 'react-router-dom';
import { Play, History, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getBreadcrumbSchema } from '../lib/utils';

export function Favorites() {
  const { favorites, history } = useAppStore();

  return (
    <div className="space-y-16 pb-24 md:pb-8">
      <Helmet>
        <title>My Library | AnimeHub+</title>
        <meta name="description" content="Access your anime watch history and favorite series on AnimeHub+." />
        <link rel="canonical" href="https://animehubplus.netlify.app/favorites" />
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', item: '/' },
            { name: 'Library', item: '/favorites' }
          ]))}
        </script>
      </Helmet>
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl md:text-4xl font-[Outfit] font-bold tracking-tight uppercase tracking-wider text-white">Continue Watching</h1>
          </div>
          <Link to="/search" className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-white px-6 py-2.5 hover:bg-indigo-600 rounded-full border border-indigo-500/20 transition-all">Explore All</Link>
        </div>
        {history.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {history.slice(0, 12).map((item) => (
              <Link
                key={`${item.animeId}-${item.lastEpisode}`}
                to={`/watch/${item.animeId}/${item.lastEpisode}`}
                className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#16161f] p-4 hover:border-indigo-500/30 hover:bg-[#1a1a25] transition-all flex flex-col gap-5 shadow-2xl"
              >
                <div className="relative aspect-[16/10] bg-[#0b0b12] rounded-[1.5rem] overflow-hidden shrink-0 shadow-lg border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <img 
                    src={item.image || 'https://via.placeholder.com/640x360?text=No+Image'} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-[2px]">
                     <div className="bg-indigo-600 shadow-2xl rounded-full p-5 transform transition-all group-hover:scale-110 group-hover:rotate-6">
                       <Play className="w-6 h-6 text-white fill-current ml-1" />
                     </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-start px-2">
                  <h3 className="text-lg font-bold truncate tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase">{item.title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Episode {item.lastEpisode}</p>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Resume</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-[#16161f] rounded-[3rem] border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-[100px]" />
             <History className="w-20 h-20 text-indigo-500/20 mx-auto mb-8" />
             <p className="text-xl font-bold uppercase text-white/50 tracking-widest">Your watch history is empty.</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8 px-2">
          <Heart className="w-8 h-8 text-indigo-500 fill-current" />
          <h2 className="text-3xl md:text-4xl font-[Outfit] font-bold tracking-tight uppercase tracking-wider text-white">My Favorites</h2>
        </div>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {favorites.map((anime) => (
              <AnimeCard key={anime.id || anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-[#16161f] rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/5 blur-[100px]" />
            <Heart className="w-20 h-20 text-indigo-500/10 mx-auto mb-8" />
            <p className="text-xl font-bold uppercase text-white/40 tracking-widest mb-10">No favorites added yet.</p>
            <Link 
              to="/search" 
              className="inline-flex bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all text-sm shadow-xl shadow-indigo-600/20"
            >
              Explore Anime
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
