import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const RecordingInterface = ({ 
  isRecording,
  onStart,
  onStop,
  disabled,
  error: externalError
}) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    if (disabled) {
      setError('Recording limit reached. Please delete some recordings or upgrade to premium.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onStop(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      onStart();
      setError('');

      // Start timer
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= 120) { // 2 minutes limit
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError('Please allow microphone access to record audio.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      {(error || externalError) && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 w-full">
          {error || externalError}
        </div>
      )}

      <div className="flex flex-col items-center space-y-4">
        {/* Recording Timer */}
        <div className="text-2xl font-mono">
          {formatTime(timer)} / 2:00
        </div>

        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-primary hover:bg-primary-dark'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled && !isRecording}
        >
          <span className="text-white text-3xl">
            {isRecording ? '⬛' : '🎤'}
          </span>
        </button>

        {/* Recording Status */}
        <p className="text-gray-600">
          {isRecording ? 'Recording in progress...' : 'Click to start recording'}
        </p>

        {/* Audio Playback */}
        {audioUrl && !isRecording && (
          <div className="w-full max-w-md mt-4">
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

RecordingInterface.propTypes = {
  isRecording: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string
};

RecordingInterface.defaultProps = {
  disabled: false,
  error: null
};

export default RecordingInterface;