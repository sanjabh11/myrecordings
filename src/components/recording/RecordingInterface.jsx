import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './RecordingInterface.css';

const RecordingInterface = ({ 
  isRecording,
  onStart,
  onStop,
  disabled,
  error: externalError,
  audioBlob
}) => {
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isWaveSurferInitialized, setIsWaveSurferInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaveSurferReady, setIsWaveSurferReady] = useState(false); // Added state variable
  
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const initializeWaveSurfer = async () => {
    if (!isWaveSurferInitialized && waveformRef.current && !wavesurfer.current) {
      try {
        // Create AudioContext only when needed
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume AudioContext if it's suspended
        if (audioContext.current.state === 'suspended') {
          await audioContext.current.resume();
        }

        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#4a90e2',
          progressColor: '#2d5a9e',
          cursorColor: '#2d5a9e',
          barWidth: 2,
          barGap: 1,
          height: 80,
          normalize: true,
          responsive: true,
          backend: 'WebAudio',
          audioContext: audioContext.current
        });

        wavesurfer.current.on('ready', () => {
          setIsWaveSurferInitialized(true);
          setIsWaveSurferReady(true); // Update the new state variable
        });

        wavesurfer.current.on('finish', () => {
          setIsPlaying(false);
        });
      } catch (err) {
        console.error('Failed to initialize WaveSurfer:', err);
        setError('Failed to initialize audio visualizer');
      }
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Microphone permission error:', err);
      setError('Please allow microphone access to record audio');
      setHasPermission(false);
    }
  };

  const startTimer = () => {
    setTimer(0);
    timerInterval.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= 120) { // 2 minutes limit
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    if (disabled) {
      setError('Recording limit reached. Please upgrade to premium for unlimited recordings.');
      return;
    }

    try {
      await initializeWaveSurfer(); // Initialize WaveSurfer before recording

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = await initAudioContext();

      const recorder = new MediaRecorder(stream);
      analyser.current = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser.current);

      analyser.current.fftSize = 2048;
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const visualize = () => {
        if (!isRecording) return;
        requestAnimationFrame(visualize);

        analyser.current.getByteTimeDomainData(dataArray);
        if (wavesurfer.current) {
          const audioData = Array.from(dataArray).map(val => (val / 128.0) - 1);
          const buffer = context.createBuffer(1, audioData.length, context.sampleRate);
          buffer.getChannelData(0).set(audioData);
          wavesurfer.current.loadDecodedBuffer(buffer);
        }
      };

      recorder.ondataavailable = (e) => chunks.current.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        chunks.current = [];
        if (wavesurfer.current) {
          const audioUrl = URL.createObjectURL(blob);
          wavesurfer.current.load(audioUrl);
        }
        onStop(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      onStart();
      startTimer();
      visualize();
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      clearInterval(timerInterval.current);
    }
  };

  const initAudioContext = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }
    return audioContext.current;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) { // 60MB limit
        setError('File size exceeds 60MB limit');
        return;
      }
      const blob = new Blob([file], { type: file.type });
      onStop(blob);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          {isRecording ? '⏹️' : '⏺️'}
        </button>

        <div className="timer">
          {formatTime(timer)}/02:00
        </div>
      </div>

      <div className="waveform-container">
        <div className="waveform" ref={waveformRef}></div>
      </div>

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