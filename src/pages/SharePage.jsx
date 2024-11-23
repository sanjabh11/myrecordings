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
        const { userId: originalUserId, recordingId: originalRecordingId } = storageHelpers.getOriginalIds(userId, recordingId);
        const url = await storageHelpers.getSharedRecordingUrl(originalUserId, originalRecordingId);
        setAudioUrl(url);
      } catch (error) {
        console.error('Error loading shared recording:', error);
        setError('Failed to load the shared recording');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedRecording();
  }, [userId, recordingId]);

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
        {isLoading ? (
          <div className={styles.loading}>Loading recording...</div>
        ) : (
          <div className={styles.player}>
            {audioUrl ? (
              <audio controls>
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div>No recording found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
