import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useParams } from 'react-router-dom';
import { storageHelpers, supabase } from '../services/supabaseClient';
import styles from './SharePage.module.css';
import { FaWhatsapp, FaTwitter, FaFacebook, FaShare, FaPause, FaPlay } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { Link } from 'react-router-dom';

const SharePage = () => {
  const { userId, recordingId } = useParams();
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isWaveformReady, setIsWaveformReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const audioUrlRef = useRef(null);

  useEffect(() => {
    const loadSharedRecording = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { userId: originalUserId, recordingId: originalRecordingId } = 
          storageHelpers.getOriginalIds(userId, recordingId);
        const url = await storageHelpers.getSharedRecordingUrl(originalUserId, originalRecordingId);
        setAudioUrl(url);
        audioUrlRef.current = url;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shared recording:', error);
        setError('Failed to load the recording. Please try again later.');
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

  const initializeWaveSurfer = async () => {
    if (!waveformRef.current || !audioUrlRef.current || wavesurferRef.current) return;

    try {
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
        setIsWaveformReady(true);
      });

      wavesurferRef.current.on('audioprocess', () => {
        setCurrentTime(wavesurferRef.current.getCurrentTime());
      });

      wavesurferRef.current.on('finish', () => {
        setIsPlaying(false);
      });

      wavesurferRef.current.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setError('Error loading audio waveform. Please try again.');
      });

      await wavesurferRef.current.load(audioUrlRef.current);
    } catch (err) {
      console.error('Error initializing WaveSurfer:', err);
      setError('Error initializing audio player. Please try again.');
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!wavesurferRef.current) {
        await initializeWaveSurfer();
      }
      
      if (wavesurferRef.current) {
        await wavesurferRef.current.playPause();
        setIsPlaying(!isPlaying);
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError('Error playing audio. Please try again.');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this recording on Sing-A-Song!\n${window.location.href}`);
    window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (error) {
    return (
      <div className={styles.sharePage}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link to="/" className={styles.logo}>
              <span className={styles.micIcon}>🎤</span>
              <h1>Sing-A-Song</h1>
            </Link>
            <nav className={styles.nav}>
              <Link to="/record" className={styles.recordButton}>
                Record Your Own
              </Link>
            </nav>
          </div>
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
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.micIcon}>🎤</span>
            <h1>Sing-A-Song</h1>
          </Link>
          <nav className={styles.nav}>
            <Link to="/record" className={styles.recordButton}>
              Record Your Own
            </Link>
          </nav>
        </div>
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

            <div className={styles.controlsWrapper}>
              <div className={styles.mainControls}>
                <button
                  className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                {isWaveformReady && (
                  <div className={styles.timeDisplay}>
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                )}
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.actionButton} onClick={handleShare}>
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.ctaSection}>
          <h3>Want to create your own recording?</h3>
          <p>Join Sing-A-Song and start sharing your voice with the world!</p>
          <div className={styles.ctaButtons}>
            <Link to="/signup" className={styles.primaryButton}>
              Sign Up Free
            </Link>
            <Link to="/record" className={styles.secondaryButton}>
              Try Recording
            </Link>
          </div>
        </div>

        {showShareModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.shareModal}>
              <h3>Share Recording</h3>
              <div className={styles.shareOptions}>
                <div className={styles.shareLink}>
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                  />
                  <button onClick={copyToClipboard}>
                    <MdContentCopy />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className={styles.socialShare}>
                  <button 
                    className={styles.shareButton}
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this recording on Sing-A-Song!')}`, '_blank')}
                  >
                    <FaTwitter /> Share on Twitter
                  </button>
                  <button 
                    className={styles.shareButton}
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <FaFacebook /> Share on Facebook
                  </button>
                  <button 
                    className={styles.shareButton}
                    onClick={shareOnWhatsApp}
                  >
                    <FaWhatsapp /> Share on WhatsApp
                  </button>
                </div>
              </div>
              <button 
                className={styles.closeButton}
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;