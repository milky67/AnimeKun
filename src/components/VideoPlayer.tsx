import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoPlayerProps {
  url: string;
  onDownload?: () => void;
  poster?: string;
}

export function VideoPlayer({ url, onDownload, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize HLS if needed
  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    if (!video) return;

    const sourceIsM3U8 = url.includes('.m3u8');

    if (sourceIsM3U8 && Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn("HLS fatal error", data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      video.src = url;
      setIsLoading(false);
    } else {
      video.src = url;
      setIsLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const manualChange = Number(e.target.value);
      videoRef.current.currentTime = (videoRef.current.duration / 100) * manualChange;
      setProgress(manualChange);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isIframe = url.includes('streaming.php') || url.includes('embed') || !url.includes('.m3u8') && !url.includes('.mp4');

  if (isIframe) {
    return (
      <div 
        ref={containerRef}
        className="relative bg-black w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      >
        <iframe
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex gap-2">
           {onDownload && (
              <button 
                onClick={onDownload}
                className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-black/80 border border-white/10"
              >
                <Download size={16} /> <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button 
              onClick={toggleFullScreen}
              className="text-white hover:text-indigo-400 transition-colors p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10"
            >
              <Maximize size={20} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative group bg-black w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={togglePlay}
        poster={poster}
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-4 transition-opacity duration-300",
          showControls ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/80 font-mono w-12 text-right">
              {formatTime(videoRef.current?.currentTime || 0)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(progress) ? 0 : progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full shadow-sm"
            />
            <span className="text-xs text-white/80 font-mono w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-indigo-400 transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
              </button>
              <button 
                onClick={toggleMute}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {onDownload && (
                <button 
                  onClick={onDownload}
                  className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20"
                >
                  <Download size={16} /> <span className="hidden sm:inline">Download</span>
                </button>
              )}
              <button className="text-white hover:text-indigo-400 transition-colors hidden sm:block">
                <Settings size={20} />
              </button>
              <button 
                onClick={toggleFullScreen}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
