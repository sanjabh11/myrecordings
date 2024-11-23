import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { storageHelpers } from '../services/supabaseClient';
import styles from './SharePage.module.css';

const SharePage = () => {
  const { userId, recordingId } = useParams();
  const [recording, setRecording] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    loadSharedRecording();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [userId, recordingId]);

  const loadSharedRecording = async () => {
    try {
      const { data, error } = await storageHelpers.getSharedRecording(userId, recordingId);
      if (error) throw new Error(error);
      if (!data) throw new Error('Recording not found');
      setRecording(data);
    } catch (err) {
      console.error('Error loading shared recording:', err);
      setError(err.message || 'Failed to load recording');
    }
  };

  const handlePlay = async () => {
    try {
      if (!recording) return;

      if (isPlaying && audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      if (!audio) {
        const newAudio = new Audio(recording.url);
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        await newAudio.play();
      } else {
        await audio.play();
      }
      
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing recording:', err);
      setError('Failed to play recording');
    }
  };

  if (error) {
    return (
      <div className={styles.sharePage}>
        <div className={styles.errorContainer}>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sharePage}>
      <div className={styles.container}>
        <h1>Shared Recording</h1>
        {recording ? (
          <div className={styles.player}>
            <button
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
              onClick={handlePlay}
            >
              {isPlaying ? '⏹️ Stop' : '▶️ Play'}
            </button>
          </div>
        ) : (
          <div className={styles.loading}>Loading recording...</div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
