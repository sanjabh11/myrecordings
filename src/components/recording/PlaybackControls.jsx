import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const PlaybackControls = ({ audioBlob }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [error, setError] = useState(null);
  
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    // Initialize WaveSurfer with noise reduction settings
    if (!wavesurfer.current) {
      try {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'var(--primary-color)',
          progressColor: 'var(--secondary-color)',
          cursorWidth: 1,
          height: 80,
          responsive: true,
          normalize: true,
          backend: 'WebAudio',
          minPxPerSec: 50,
          barWidth: 2,
          barGap: 1,
          interact: true,
        });

        // Add audio processing for noise reduction
        wavesurfer.current.on('ready', () => {
          try {
            const audioContext = wavesurfer.current.backend.ac;
            if (audioContext && wavesurfer.current.backend.source) {
              const source = wavesurfer.current.backend.source;

              // Create filters
              const lowpass = audioContext.createBiquadFilter();
              lowpass.type = 'lowpass';
              lowpass.frequency.value = 8000;
              lowpass.Q.value = 0.5;

              const highpass = audioContext.createBiquadFilter();
              highpass.type = 'highpass';
              highpass.frequency.value = 20;
              highpass.Q.value = 0.5;

              // Connect the filters
              source.disconnect();
              source.connect(highpass);
              highpass.connect(lowpass);
              lowpass.connect(audioContext.destination);
            }
            setDuration(formatTime(wavesurfer.current.getDuration()));
          } catch (err) {
            console.warn('Audio processing setup failed:', err);
            // Continue without audio processing if it fails
          }
        });

        wavesurfer.current.on('audioprocess', () => {
          setCurrentTime(formatTime(wavesurfer.current.getCurrentTime()));
        });

        wavesurfer.current.on('error', (err) => {
          console.error('WaveSurfer error:', err);
          setError('Failed to load audio. Please try again.');
        });

        wavesurfer.current.on('finish', () => {
          setIsPlaying(false);
        });
      } catch (err) {
        console.error('WaveSurfer initialization error:', err);
        setError('Failed to initialize audio player');
      }
    }

    // Load audio blob
    if (audioBlob) {
      try {
        // Clean up previous URL if it exists
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        wavesurfer.current.load(audioUrlRef.current);
      } catch (err) {
        console.error('Audio loading error:', err);
        setError('Failed to load audio file');
      }
    }

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [audioBlob]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = (e) => {
    e.preventDefault(); // Prevent default link behavior
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const applyEffect = (effect) => {
    setSelectedEffect(effect);
    // Voice effect implementation will go here
  };

  return (
    <div className="playback-controls">
      {error && <div className="error-message">{error}</div>}
      <div className="audio-player">
        <button 
          className={`play-pause-button ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayPause}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div ref={waveformRef} className="waveform-playback"></div>
        
        <div className="time-display">
          {currentTime} / {duration}
        </div>
      </div>

      <div className="modification-controls">
        <select 
          value={selectedEffect || ''} 
          onChange={(e) => applyEffect(e.target.value)}
          className="effect-select"
        >
          <option value="">Select Effect</option>
          <option value="pitch">Pitch Shift</option>
          <option value="echo">Echo</option>
          <option value="reverb">Reverb</option>
          <option value="robot">Robot Voice</option>
        </select>
        
        <button className="save-button">
          Save Recording
        </button>
      </div>
    </div>
  );
};

export default PlaybackControls; 