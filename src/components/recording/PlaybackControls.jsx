// src/components/recording/PlaybackControls.jsx
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';

const PlaybackControls = ({ audioBlob, onSave }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [error, setError] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioUrlRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!waveformRef.current) return;

    // Cleanup previous instance
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    try {
      // Initialize WaveSurfer with proper configuration
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F4F4F',
        progressColor: '#2D9CDB',
        cursorColor: '#2D9CDB',
        height: 80,
        normalize: true,
        backend: 'WebAudio'
      });

      // Set up event listeners
      wavesurfer.current.on('ready', () => {
        setDuration(formatTime(wavesurfer.current.getDuration()));
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(formatTime(wavesurfer.current.getCurrentTime()));
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
      });

      // Load audio if blob exists
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
        wavesurfer.current.load(audioUrl);
      }
    } catch (err) {
      console.error('WaveSurfer initialization error:', err);
      setError('Failed to initialize audio player');
    }

    // Cleanup function
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioBlob]);

  const handleSave = async () => {
    if (!audioBlob || !user) return;

    try {
      setIsSaving(true);
      const fileName = `recording_${Date.now()}.webm`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(filePath);

      // Create database record
      const { error: dbError } = await supabase
        .from('recordings')
        .insert([{
          user_id: user.id,
          file_path: filePath,
          public_url: publicUrl,
          name: fileName,
          duration: wavesurfer.current?.getDuration() || 0
        }]);

      if (dbError) throw dbError;

      alert('Recording saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
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
          onChange={(e) => setSelectedEffect(e.target.value)}
          className="effect-select"
        >
          <option value="">Select Effect</option>
          <option value="pitch">Pitch Shift</option>
          <option value="echo">Echo</option>
          <option value="reverb">Reverb</option>
        </select>
        
        {user && (
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Recording'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaybackControls;