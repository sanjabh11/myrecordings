import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RecordingInterface from '../components/recording/RecordingInterface';
import RecordingsList from '../components/recording/RecordingsList';
import RecordingHeader from '../components/recording/RecordingHeader';
import RecordingGuide from '../components/recording/RecordingGuide';
import useAnonymousStorage from '../hooks/useAnonymousStorage';
import { FaHome } from 'react-icons/fa';

const RecordingStudio = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  
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
      setRecordingError(err.message);
    }
  };

  const handlePermissionChange = (hasPermission) => {
    setHasPermission(hasPermission);
  };

  const filteredRecordings = recordings.filter(recording => 
    recording.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="recording-studio">
      <div className="w-full flex justify-center py-4 bg-white shadow-sm">
        <Link 
          to="/" 
          className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
        >
          <FaHome className="text-xl" />
          <span>RecordNow</span>
        </Link>
      </div>

      <RecordingHeader 
        onSearch={handleSearch}
        recordingCount={recordings.length}
        maxRecordings={10}
      />

      {showGuide && (
        <RecordingGuide
          hasPermission={hasPermission}
          onClose={() => setShowGuide(false)}
        />
      )}

      <div className="recording-interface-container">
        <RecordingInterface
          isRecording={isRecording}
          onStart={handleRecordingStart}
          onStop={handleRecordingStop}
          onPermissionChange={handlePermissionChange}
          disabled={recordings.length >= 10}
          error={recordingError || storageError}
        />
      </div>

      {recordingError && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{recordingError}</span>
        </div>
      )}

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