/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Play } from 'lucide-react';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const AnimeDetails = lazy(() => import('./pages/AnimeDetails').then(m => ({ default: m.AnimeDetails })));
const Watch = lazy(() => import('./pages/Watch').then(m => ({ default: m.Watch })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#05050a] flex flex-col items-center justify-center z-[100]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-6 h-6 text-indigo-500 fill-current" />
        </div>
      </div>
      <p className="mt-6 text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading Universe</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="anime/:id" element={<AnimeDetails />} />
            <Route path="watch/:id/:episode" element={<Watch />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
