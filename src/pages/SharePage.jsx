import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { storageHelpers } from '../services/supabaseClient';
import styles from './SharePage.module.css';

const SharePage = () => {
  const { userId, recordingId } = useParams();
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSharedRecording = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading recording with IDs:', { userId, recordingId });
        const { userId: originalUserId, recordingId: originalRecordingId } = storageHelpers.getOriginalIds(userId, recordingId);
        console.log('Original IDs:', { originalUserId, originalRecordingId });

        const url = await storageHelpers.getSharedRecordingUrl(originalUserId, originalRecordingId);
        console.log('Got URL:', url);
        setAudioUrl(url);
      } catch (error) {
        console.error('Error loading shared recording:', error);
        if (error.message.includes('Failed to convert')) {
          setError('Invalid share link. The link might be malformed or expired.');
        } else if (error.message.includes('Recording not found')) {
          setError('This recording has been deleted or is no longer available.');
        } else {
          setError('Failed to load the shared recording. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedRecording();
  }, [userId, recordingId]);

  if (error) {
    return (
      <div className={styles.sharePage}>
        <header className={styles.header}>
          <a href="https://sing-a-song.netlify.app" className={styles.homeLink}>
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
      <header className={styles.header}>
        <a href="https://sing-a-song.netlify.app" className={styles.homeLink}>
          <h2>Sing-A-Song</h2>
          <span>Return to Homepage</span>
        </a>
      </header>
      <div className={styles.container}>
        <h1>Shared Recording</h1>
        {isLoading ? (
          <div className={styles.loading}>Loading recording...</div>
        ) : (
          <div className={styles.player}>
            {audioUrl ? (
              <audio controls className={styles.audioPlayer}>
                <source src={audioUrl} type="audio/mpeg" />
                <source src={audioUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className={styles.noRecording}>No recording found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
