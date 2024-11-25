import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useParams } from 'react-router-dom';
import { storageHelpers } from '../services/supabaseClient';
import styles from './SharePage.module.css';

const SharePage = () => {
  const { userId, recordingId } = useParams();
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    const loadSharedRecording = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { userId: originalUserId, recordingId: originalRecordingId } = 
          storageHelpers.getOriginalIds(userId, recordingId);
        const url = await storageHelpers.getSharedRecordingUrl(originalUserId, originalRecordingId);
        setAudioUrl(url);

        // Initialize WaveSurfer
        if (waveformRef.current && !wavesurferRef.current) {
          wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#4a90e2',
            progressColor: '#2d5a9e',
            cursorColor: '#2d5a9e',
            barWidth: 2,
            barGap: 1,
            height: 80,
            responsive: true,
            normalize: true,
            backend: 'WebAudio'
          });

          wavesurferRef.current.on('ready', () => {
            setDuration(wavesurferRef.current.getDuration());
            setIsLoading(false);
          });

          wavesurferRef.current.on('audioprocess', () => {
            setCurrentTime(wavesurferRef.current.getCurrentTime());
          });

          wavesurferRef.current.on('finish', () => {
            setIsPlaying(false);
          });

          wavesurferRef.current.load(url);
        }
      } catch (error) {
        console.error('Error loading shared recording:', error);
        setError('Failed to load the recording. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedRecording();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [userId, recordingId]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={styles.sharePage}>
        <header className={styles.header}>
          <a href="https://sing-a-song.netlify.app/record" className={styles.homeLink}>
            <h2>Sing-A-Song</h2>
            <span>Return to Homepage</span>
          </a>
        </header>
        <div className={styles.errorContainer}>
          <h1>Unable to Play Recording</h1>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sharePage}>
      <div className={styles.musicalBackground}>
        <div className={styles.floatingNote}>♪</div>
        <div className={styles.floatingNote}>♫</div>
        <div className={styles.floatingNote}>♬</div>
      </div>

      <header className={styles.header}>
        <a href="https://sing-a-song.netlify.app/record" className={styles.homeLink}>
          <span className={styles.micIcon}>🎤</span>
          <div className={styles.headerText}>
            <h2>Sing-A-Song</h2>
            <span>To Sing-A-Song click</span>
          </div>
        </a>
      </header>

      <div className={styles.container}>
        <div className={styles.recordingTitleSection}>
          <span className={styles.recordingMicIcon}>🎙️</span>
          <h2>Shared Recording</h2>
        </div>

        <div className={styles.recordingMessage}>
          <p>Experience the joy of music sharing!</p>
          <span className={styles.musicNote}>♪</span>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading your musical moment...</p>
          </div>
        ) : (
          <div className={styles.playerSection}>
            <div className={styles.waveformContainer} ref={waveformRef}></div>

            <div className={styles.controls}>
              <button
                className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                onClick={togglePlayPause}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>

              <div className={styles.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;