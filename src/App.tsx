/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Play } from 'lucide-react';

const retryLazy = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assuming that the user is not on the latest version, let's refresh the page immediately.
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      // The page has already been reloaded
      // Assuming that user is already using the latest version of the application.
      throw error;
    }
  });

const Home = retryLazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search = retryLazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const AnimeDetails = retryLazy(() => import('./pages/AnimeDetails').then(m => ({ default: m.AnimeDetails })));
const Watch = retryLazy(() => import('./pages/Watch').then(m => ({ default: m.Watch })));
const Favorites = retryLazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const NotFound = retryLazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
          <div className="bg-[#101018] p-8 rounded-xl border border-red-500/20 max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-4">The application encountered an unexpected error.</p>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-gray-500 mb-4">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
