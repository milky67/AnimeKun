import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { formatScore, formatYear } from '../lib/utils';

interface AnimeCardProps {
  key?: React.Key;
  anime: any;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const navigate = useNavigate();
  const imageUrl = anime.img || (anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url);
  const animeId = anime.id || anime.mal_id;
  const animeTitle = anime.title_english || anime.title;
  const rating = formatScore(anime.score || anime.rating, animeId);
  
  return (
    <Link to={`/anime/${animeId}`} className="group relative rounded-2xl overflow-hidden bg-[#16161f] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1a1a25] transition-all duration-500 cursor-pointer flex flex-col shadow-lg active:scale-[0.98]">
      <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden shrink-0">
        <img
          src={imageUrl || 'https://via.placeholder.com/600x800?text=No+Image'}
          alt={animeTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quality overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent"></div>
        
        {rating && (
          <div className="absolute top-3 right-3 bg-indigo-600 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-indigo-500/20">
            <Star className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 backdrop-blur-[2px]">
          <div className="bg-white text-black shadow-2xl rounded-full p-4 flex items-center justify-center">
            <Play className="w-5 h-5 fill-current ml-1" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-start p-4">
        <h3 className="font-[Outfit] font-bold text-sm md:text-base leading-tight line-clamp-2 text-white group-hover:text-indigo-400 transition-colors" title={animeTitle}>
          {animeTitle}
        </h3>
        
        {/* Genres/Tags */}
        {anime.genres && Array.isArray(anime.genres) && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {anime.genres.slice(0, 2).map((genre: any) => {
              const gName = typeof genre === 'string' ? genre : genre.name;
              const gId = typeof genre === 'string' ? genre.toLowerCase() : genre.mal_id;
              return (
                <span
                  key={gId}
                  className="text-[10px] font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-gray-400"
                >
                  {gName}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5 mt-4">
          <span className="text-[11px] text-gray-500 font-medium">{formatYear(anime.released || anime.year || anime.aired?.prop?.from?.year)}</span>
          <span className="text-[10px] text-indigo-400/80 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/10 uppercase tracking-wider">{anime.type || (anime.episodes ? `${anime.episodes} EP` : 'TV')}</span>
        </div>
      </div>
    </Link>
  );
}
