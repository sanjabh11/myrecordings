import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlaybackControls from '../components/recording/PlaybackControls';
import { storageHelpers } from '../services/supabaseClient';
import '../styles/SharedRecording.css';
import { FaMicrophone, FaMusic } from 'react-icons/fa';

const SharedRecording = () => {
  const { userId, recordingId } = useParams();
  const [recording, setRecording] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        setIsLoading(true);
        
        // Get the public URL for the recording
        const publicUrl = storageHelpers.getPublicUrl(userId, recordingId);
        
        // Fetch the audio file
        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch recording');
        }

        const blob = await response.blob();
        
        // Get metadata for the recording
        const { data: metadata, error: metadataError } = await storageHelpers.getRecordingMetadata(userId, recordingId);
        
        if (metadataError) {
          console.warn('Failed to fetch metadata:', metadataError);
        }

        setRecording({
          name: recordingId.split('.')[0], // Remove file extension for display
          blob,
          createdAt: metadata?.createdAt || new Date().toISOString(),
          metadata: {
            size: metadata?.size || blob.size,
            type: blob.type,
            userId
          }
        });
      } catch (err) {
        console.error('Error fetching recording:', err);
        setError('Recording not found or has expired');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && recordingId) {
      fetchRecording();
    }
  }, [userId, recordingId]);

  return (
    <div className="shared-recording-page">
      <div className="musical-background"></div>
      <div className="shared-recording-container">
        <div className="shared-recording-header">
          <div className="logo-section">
            <FaMicrophone className="mic-logo" />
            <a href="https://sing-a-song.netlify.app/" className="return-link">
              Return to Homepage
            </a>
          </div>
        </div>

        <div className="recording-title-section">
          <FaMicrophone className="recording-mic-icon" />
          <h2>Shared Recording</h2>
        </div>

        <div className="recording-message">
          <p>Experience the joy of music! You too can record a 2-minute song and share it with others.</p>
          <FaMusic className="music-note" />
        </div>

        {isLoading ? (
          <div className="loading">
            Loading recording...
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
          </div>
        ) : !recording ? (
          <div className="error-message">
            Recording not found
          </div>
        ) : (
          <div className="recording-content">
            <div className="recording-details">
              <h3>{recording.name}</h3>
              <div className="metadata">
                <p>Created: {new Date(recording.createdAt).toLocaleString()}</p>
                <p>Size: {(recording.metadata.size / 1024).toFixed(2)} KB</p>
                <p>Type: {recording.metadata.type}</p>
              </div>
            </div>
            
            <div className="playback-section">
              <PlaybackControls audioBlob={recording.blob} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedRecording;
