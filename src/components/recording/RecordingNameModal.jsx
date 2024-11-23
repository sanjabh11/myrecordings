import React, { useState } from 'react';
import '../../styles/RecordingNameModal.css';

const RecordingNameModal = ({ isOpen, onClose, onSave }) => {
  const [recordingName, setRecordingName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (recordingName.trim()) {
      onSave(recordingName.trim());
      setRecordingName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Name Your Recording</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            placeholder="Enter recording name"
            autoFocus
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordingNameModal;
