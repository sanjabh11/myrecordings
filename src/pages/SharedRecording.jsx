import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlaybackControls from '../components/recording/PlaybackControls';
import { storageHelpers } from '../services/supabaseClient';
import '../styles/SharedRecording.css';

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

  if (isLoading) {
    return (
      <div className="shared-recording-container">
        <div className="loading">
          Loading recording...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-recording-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="shared-recording-container">
        <div className="error-message">
          Recording not found
        </div>
      </div>
    );
  }

  return (
    <div className="shared-recording-container">
      <div className="recording-details">
        <h1>{recording.name}</h1>
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
  );
};

export default SharedRecording;
