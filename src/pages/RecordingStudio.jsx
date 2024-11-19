import React, { useState, useEffect } from 'react';
import RecordingHeader from '../components/recording/RecordingHeader';
import RecordingInterface from '../components/recording/RecordingInterface';
import PlaybackControls from '../components/recording/PlaybackControls';
import SharingOptions from '../components/recording/SharingOptions';
import RecordingsList from '../components/recording/RecordingsList';
import { useAnonymousStorage } from '../hooks/useAnonymousStorage';

const RecordingStudio = () => {
  const [recordingCount, setRecordingCount] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [error, setError] = useState(null);
  
  // Get the hook values
  const { recordings, addRecording, storageError } = useAnonymousStorage();

  // Update recording count when recordings change
  useEffect(() => {
    setRecordingCount(recordings.length); // Update recording count based on recordings array
  }, [recordings]);

  const handleRecordingComplete = async (blob) => {
    try {
      const recording = await addRecording(blob, {
        type: 'recording',
        duration: 0,
        name: `Recording ${recordingCount + 1}`
      });
      setAudioBlob(blob);
      setIsRecording(false);
      setError(null);
    } catch (error) {
      console.error('Failed to save recording:', error);
      setError(error.message);
    }
  };

  const handleRecordingSelect = (recording) => {
    if (recording && recording.blob) {
      setSelectedRecording(recording);
      setAudioBlob(recording.blob);
    }
  };

  return (
    <div className="recording-studio">
      <RecordingHeader recordingCount={recordingCount} />
      
      <main className="recording-interface">
        {(error || storageError) && (
          <div className="error-message">
            {error || storageError}
          </div>
        )}
        
        <div className="search-bar">
          <input type="search" placeholder="Search reverbs" />
          <button className="cancel-button">CANCEL</button>
        </div>

        <RecordingInterface 
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          onRecordingComplete={handleRecordingComplete}
          recordingCount={recordingCount}
        />
        
        {(audioBlob || selectedRecording) && (
          <>
            <PlaybackControls 
              audioBlob={selectedRecording?.blob || audioBlob} 
            />
            <SharingOptions 
              audioBlob={selectedRecording?.blob || audioBlob} 
            />
          </>
        )}

        <RecordingsList onSelect={handleRecordingSelect} />
      </main>
    </div>
  );
};

export default RecordingStudio;