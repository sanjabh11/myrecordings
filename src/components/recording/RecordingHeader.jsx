import React from 'react';
import { Link } from 'react-router-dom';

const RecordingHeader = ({ recordingCount }) => {
  const maxRecordings = 10;
  const canRecord = recordingCount < maxRecordings;

  return (
    <header className="recording-header">
      <div className="logo">
        <Link to="/">RecordNow</Link>
      </div>
      <div className="recording-counter">
        <span>RECORDINGS: <span id="count">{recordingCount}</span>/{maxRecordings}</span>
        {!canRecord && (
          <Link to="/premium" className="upgrade-link">
            FOR UNLIMITED USAGE SUBSCRIBE TO PREMIUM
          </Link>
        )}
      </div>
    </header>
  );
};

export default RecordingHeader;