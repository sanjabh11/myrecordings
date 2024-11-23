import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecordingInterface from '../components/recording/RecordingInterface';
import RecordingsList from '../components/recording/RecordingsList';
import RecordingHeader from '../components/recording/RecordingHeader';
import useAnonymousStorage from '../hooks/useAnonymousStorage';

const RecordingStudio = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  
  const {
    recordings,
    addRecording,
    deleteRecording,
    clearAllRecordings,
    getRecordingBlob,
    storageError
  } = useAnonymousStorage();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleRecordingStart = () => {
    if (recordings.length >= 10) {
      setRecordingError('Recording limit reached. Please delete some recordings or upgrade to premium.');
      return;
    }
    setIsRecording(true);
    setRecordingError(null);
  };

  const handleRecordingStop = async (blob) => {
    setIsRecording(false);
    try {
      await addRecording(blob);
      setRecordingError(null);
    } catch (err) {
      console.error('Recording error:', err);
      setRecordingError(err.message);
    }
  };

  const handleDelete = async (recordingId) => {
    try {
      await deleteRecording(recordingId);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredRecordings = recordings.filter(recording => 
    recording.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recording-studio">
      <RecordingHeader 
        onSearch={handleSearch}
        recordingCount={recordings.length}
        maxRecordings={10}
      />
      <RecordingInterface
        isRecording={isRecording}
        onStart={handleRecordingStart}
        onStop={handleRecordingStop}
        disabled={recordings.length >= 10}
        error={recordingError || storageError}
      />
      <RecordingsList
        recordings={filteredRecordings}
        onDelete={handleDelete}
        getRecordingBlob={getRecordingBlob}
        error={storageError}
      />
    </div>
  );
};

export default RecordingStudio;