import React from 'react';
import { useAnonymousStorage } from '../../hooks/useAnonymousStorage';

const RecordingsList = ({ onSelect }) => {
  const { recordings, deleteRecording, getRecordingBlob } = useAnonymousStorage();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handlePlay = (e, recording) => {
    e.preventDefault(); // Prevent default link behavior
    const blob = getRecordingBlob(recording);
    if (blob) {
      onSelect({ ...recording, blob });
    }
  };

  return (
    <div className="recordings-list">
      <h2>Your Recordings</h2>
      {recordings.length === 0 ? (
        <p className="no-recordings">No recordings yet</p>
      ) : (
        <div className="recordings-grid">
          {recordings.map((recording) => (
            <div key={recording.id} className="recording-card">
              <div className="recording-info">
                <h3>{recording.name}</h3>
                <p>Created: {formatDate(recording.createdAt)}</p>
                <p className="expiry-notice">
                  Expires in {getDaysUntilExpiry(recording.expiresAt)} days
                </p>
              </div>
              <div className="recording-actions">
                <button 
                  onClick={(e) => handlePlay(e, recording)} 
                  className="play-button"
                >
                  Play
                </button>
                <button 
                  onClick={() => deleteRecording(recording.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingsList; 