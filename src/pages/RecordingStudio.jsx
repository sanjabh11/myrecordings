import React, { useState } from 'react';
import RecordingHeader from '../components/recording/RecordingHeader';
import RecordingInterface from '../components/recording/RecordingInterface';
import PlaybackControls from '../components/recording/PlaybackControls';
import AudioEffects from '../components/recording/AudioEffects';
import SharingOptions from '../components/recording/SharingOptions';
import RecordingsList from '../components/recording/RecordingsList';
import { useRecordings } from '../hooks/useRecordings';
import '../styles/recording.css';

const RecordingStudio = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  
  const {
    recordings,
    loading,
    error,
    addRecording,
    isAuthenticated
  } = useRecordings();

  const handleRecordingComplete = async (blob) => {
    try {
      const recording = await addRecording(blob, {
        type: 'recording',
        duration: 0,
        name: `Recording ${recordings.length + 1}`
      });
      setAudioBlob(blob);
      setIsRecording(false);
      setShowEffects(true);
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  };

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
    setAudioBlob(recording.blob);
    setShowEffects(true);
  };

  return (
    <div className="recording-studio">
      <RecordingHeader 
        recordingCount={recordings.length} 
        isAuthenticated={isAuthenticated}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <RecordingInterface 
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          onRecordingComplete={handleRecordingComplete}
          recordingCount={recordings.length}
        />
        
        {(audioBlob || selectedRecording) && (
          <>
            <PlaybackControls 
              audioBlob={selectedRecording?.blob || audioBlob} 
            />
            {showEffects && (
              <AudioEffects onApplyEffect={() => {}} />
            )}
            <SharingOptions 
              recording={selectedRecording}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}

        <RecordingsList 
          onSelect={handleRecordingSelect}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default RecordingStudio;