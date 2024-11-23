import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './RecordingInterface.css';

const RecordingInterface = ({ 
  isRecording,
  onStart,
  onStop,
  disabled,
  error: externalError
}) => {
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Initialize WaveSurfer when the container is ready
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      try {
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#4a9eff',
          progressColor: '#1976d2',
          cursorWidth: 1,
          height: 50,
          normalize: true,
          responsive: true,
        });

        return () => {
          if (wavesurfer.current) {
            wavesurfer.current.destroy();
          }
        };
      } catch (err) {
        console.error('Failed to initialize WaveSurfer:', err);
      }
    }
  }, [waveformRef]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (disabled) {
      setError('Recording limit reached. Please upgrade to premium for unlimited recordings.');
      return;
    }

    try {
      if (!hasPermission) {
        await checkMicrophonePermission();
        if (!hasPermission) return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm; codecs=opus' });
        chunks.current = [];
        onStop(blob);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      onStart();
      startTimer();
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      stopTimer();
    }
  };

  const startTimer = () => {
    const startTime = Date.now() - timer * 1000;
    timerInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed >= 120) { // 2 minutes limit
        stopRecording();
      } else {
        setTimer(elapsed);
      }
    }, 100);
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setTimer(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) { // 60MB limit
        setError('File size exceeds 60MB limit');
        return;
      }
      onStop(file);
    }
  };

  return (
    <div className="recording-interface">
      {(error || externalError) && <div className="error-message">{error || externalError}</div>}
      
      <div className="recording-controls">
        <button
          className={`record-button ${isRecording ? 'recording' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled && !isRecording}
        >
          {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
        </button>

        <div className="timer">
          {formatTime(timer)}/02:00
        </div>
      </div>

      <div className="waveform" ref={waveformRef}></div>

      <div className="file-upload">
        <p>OR</p>
        <label className={`file-upload-label ${disabled ? 'disabled' : ''}`}>
          SELECT AUDIO FILE
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
          />
        </label>
        <p className="file-upload-hint">
          DROP YOUR MP3/WAV/M4A/AAC HERE. 60MB LIMIT
        </p>
      </div>
    </div>
  );
};

export default RecordingInterface;