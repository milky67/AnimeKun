import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Home, Heart, PlaySquare, Compass, Tv, Download } from 'lucide-react';

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the beforeinstallprompt event for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: If not installable via PWA prompt, you can point to a direct APK link if you have one.
      alert('To install, use your browser menu "Add to Home Screen" or "Install App".');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Mesh Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-violet-900/10 rounded-full blur-[160px] pointer-events-none z-0"></div>

      <div className="relative flex flex-col min-h-screen w-full z-10 transition-colors duration-500">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0b0b12]/80 backdrop-blur-3xl border-b border-white/5 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full px-4 lg:px-8">
            <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                 <PlaySquare className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-[Outfit] font-bold tracking-tight text-white block">
                AnimeHub<span className="text-indigo-500">+</span>
              </span>
            </NavLink>

            <div className="flex-1 max-w-3xl px-4 md:px-8 flex items-center justify-end md:justify-between ml-auto">
              <nav className="hidden md:flex items-center gap-2 lg:gap-6 text-sm font-medium">
                <NavLink to="/" className={({isActive}) => `px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "text-white bg-white/10 border border-white/10 shadow-sm" : "text-gray-400 hover:text-white"}`}>Home</NavLink>
                <NavLink to="/search" className={({isActive}) => `px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "text-white bg-white/10 border border-white/10 shadow-sm" : "text-gray-400 hover:text-white"}`}>Explore</NavLink>
                <NavLink to="/favorites" className={({isActive}) => `px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "text-white bg-white/10 border border-white/10 shadow-sm" : "text-gray-400 hover:text-white"}`}>Watchlist</NavLink>
                {deferredPrompt && (
                  <button onClick={handleInstallClick} className="ml-2 lg:ml-4 px-4 py-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all duration-300 border border-indigo-500/20 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Install
                  </button>
                )}
              </nav>

              <form onSubmit={handleSearch} className="relative w-full max-w-[200px] lg:max-w-[250px] hidden md:block group">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#16161f] border border-white/5 text-sm text-white rounded-full px-4 py-2.5 pl-10 focus:outline-none focus:border-indigo-500/50 focus:bg-[#1a1a25] transition-all duration-300 placeholder:text-gray-600 shadow-sm"
                />
                <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors duration-300" />
              </form>

              {/* Mobile search toggle */}
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2.5 bg-[#16161f] border border-white/5 rounded-xl hover:bg-[#1a1a25] transition-colors"
              >
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchOpen && (
          <div className="md:hidden sticky top-16 z-40 bg-[#0b0b12]/95 backdrop-blur-xl border-b border-white/5 p-4 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                autoFocus
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#16161f] border border-white/10 px-5 py-3.5 pl-11 rounded-xl outline-none text-white font-medium focus:border-indigo-500/50 transition-colors"
              />
              <SearchIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400" />
            </form>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer for SEO and navigation */}
        <footer className="mt-auto border-t border-white/5 bg-[#0b0b12] py-16 px-4 sm:px-6 lg:px-8 pb-32 md:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <NavLink to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <PlaySquare className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-xl font-[Outfit] font-bold text-white">AnimeHub<span className="text-indigo-500">+</span></span>
              </NavLink>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                The ultimate destination for watching anime online in high quality for free. Stream your favorite series without any interruptions.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-widest text-[10px] uppercase">Navigation</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><NavLink to="/" className="hover:text-indigo-400 transition-colors">Home</NavLink></li>
                <li><NavLink to="/search" className="hover:text-indigo-400 transition-colors">Browse Anime</NavLink></li>
                <li><NavLink to="/favorites" className="hover:text-indigo-400 transition-colors">My Watchlist</NavLink></li>
                <li><NavLink to="/search?type=trending" className="hover:text-indigo-400 transition-colors">Trending Now</NavLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-widest text-[10px] uppercase">Browse by Category</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><Link to="/search?type=trending" className="hover:text-indigo-400 transition-colors">Trending Anime</Link></li>
                <li><Link to="/search?type=movie" className="hover:text-indigo-400 transition-colors">Anime Movies</Link></li>
                <li><Link to="/search?type=seasonal" className="hover:text-indigo-400 transition-colors">Latest Season</Link></li>
                <li><Link to="/search?type=toprated" className="hover:text-indigo-400 transition-colors">Top Rated Series</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-widest text-[10px] uppercase">Community</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium tracking-tight">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Discord Server</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li className="text-[10px] text-gray-600 mt-4 leading-normal">
                  AnimeHub+ does not store any files on its server. All contents are provided by non-affiliated third parties.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
              © 2026 AnimeHub+ • All Rights Reserved
            </p>
            <div className="flex gap-6">
              <span className="text-indigo-400 font-bold text-[10px] tracking-widest cursor-default">LIGHTNING FAST STREAMING</span>
            </div>
          </div>
        </footer>

        {/* Mobile nav indicator */}
        <nav className="md:hidden fixed bottom-6 inset-x-4 h-16 bg-[#16161f]/90 backdrop-blur-3xl border border-white/10 flex items-center justify-around z-50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 p-2 w-[22%] transition-all duration-300 ${isActive ? "text-indigo-500" : "text-gray-500 hover:text-white"}`}>
            {({ isActive }) => (
              <>
                <Home className={`w-5 h-5 ${isActive ? "fill-indigo-500/20 scale-110" : ""}`} />
                <span className="text-[10px] font-bold tracking-tight">Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/search" className={({isActive}) => `flex flex-col items-center gap-1 p-2 w-[22%] transition-all duration-300 ${isActive ? "text-indigo-500" : "text-gray-500 hover:text-white"}`}>
            {({ isActive }) => (
              <>
                <Compass className={`w-5 h-5 ${isActive ? "fill-indigo-500/20 scale-110" : ""}`} />
                <span className="text-[10px] font-bold tracking-tight">Browse</span>
              </>
            )}
          </NavLink>
          <NavLink to="/favorites" className={({isActive}) => `flex flex-col items-center gap-1 p-2 w-[22%] transition-all duration-300 ${isActive ? "text-indigo-500" : "text-gray-500 hover:text-white"}`}>
            {({ isActive }) => (
              <>
                <Heart className={`w-5 h-5 ${isActive ? "fill-indigo-500/20 scale-110" : ""}`} />
                <span className="text-[10px] font-bold tracking-tight">List</span>
              </>
            )}
          </NavLink>
          {deferredPrompt && (
            <button onClick={handleInstallClick} className="flex flex-col items-center gap-1 p-2 w-[22%] text-indigo-400 transition-colors hover:text-indigo-300">
              <Download className="w-5 h-5" />
              <span className="text-[10px] font-bold">App</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
