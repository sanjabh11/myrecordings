import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { PlayIcon, PauseIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const PlaybackControls = ({ audioBlob }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioUrlRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (!wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#b9dffd',
        progressColor: '#0070c4',
        cursorWidth: 0,
        height: 64,
        responsive: true,
        normalize: true,
        backend: 'WebAudio',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        interact: true,
        hideScrollbar: true,
        fillParent: true,
        minPxPerSec: 50,
        scrollParent: false
      });

      wavesurfer.current.on('ready', () => {
        setIsLoading(false);
        setIsReady(true);
        setDuration(formatTime(wavesurfer.current.getDuration()));
        
        // Only zoom if we have valid audio data
        if (wavesurfer.current.getDuration() > 0) {
          try {
            const minPxPerSec = 50;
            const containerWidth = waveformRef.current.clientWidth;
            const duration = wavesurfer.current.getDuration();
            const desiredZoom = (containerWidth / duration) / minPxPerSec;
            wavesurfer.current.zoom(Math.max(20, Math.min(100, desiredZoom)));
          } catch (err) {
            console.warn('Non-critical zoom error:', err);
          }
        }
      });

      wavesurfer.current.on('audioprocess', () => {
        if (!wavesurfer.current) return;
        const currentTimeValue = wavesurfer.current.getCurrentTime();
        setCurrentTime(formatTime(currentTimeValue));
        
        if (progressBarRef.current) {
          const progress = (currentTimeValue / wavesurfer.current.getDuration()) * 100;
          progressBarRef.current.style.width = `${progress}%`;
        }
      });

      wavesurfer.current.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setError('Failed to load audio. Please try again.');
        setIsLoading(false);
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioBlob && wavesurfer.current) {
      setIsLoading(true);
      setError(null);
      setIsReady(false);

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      try {
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        wavesurfer.current.load(audioUrlRef.current);
      } catch (err) {
        console.error('Error loading audio:', err);
        setError('Failed to load audio file');
        setIsLoading(false);
      }
    }

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = (e) => {
    e.preventDefault();
    if (wavesurfer.current && !isLoading && isReady) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlayPause}
            disabled={isLoading || !isReady}
            className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center text-white shadow-md disabled:opacity-50"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </button>
          
          <div className="flex-1 relative h-16 bg-gray-50 rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            <div 
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full bg-primary-600/10 transition-all duration-100"
              style={{ width: '0%' }}
            ></div>
            <div ref={waveformRef} className="absolute inset-0"></div>
          </div>
          
          <div className="font-mono text-sm text-gray-600 min-w-[80px] text-right">
            {currentTime} / {duration}
          </div>

          <button 
            onClick={handleSave}
            disabled={isLoading || !isReady}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary-600 text-white hover:bg-secondary-700 transition-colors shadow-md disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;