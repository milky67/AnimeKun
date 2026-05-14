import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Ghost, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <Helmet>
        <title>404 - Page Not Found | AnimeHub+</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="relative mb-8">
        <Ghost className="w-24 h-24 text-indigo-500/20 animate-bounce" />
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-6xl font-black text-indigo-500 opacity-50">404</div>
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-[Outfit] font-bold text-white mb-4">Oops! Page Lost in Space</h1>
      <p className="text-gray-400 mb-10 max-w-md mx-auto font-medium">
        The anime series or page you are looking for seems to have been erased from existence or moved to a different timeline.
      </p>
      
      <Link 
        to="/" 
        className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-600/20"
      >
        <Home className="w-5 h-5" />
        Return to Safety
      </Link>
    </div>
  );
}
