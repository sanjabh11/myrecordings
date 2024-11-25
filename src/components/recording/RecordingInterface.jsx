import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Timeline from 'wavesurfer.js/dist/plugins/timeline.js';
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
  const [isPlaying, setIsPlaying] = useState(false);
  
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

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
          backend: 'WebAudio',
          plugins: [
            Timeline.create({
              container: '#timeline',
              timeInterval: 0.1,
              primaryLabelInterval: 1,
              secondaryLabelInterval: 0.5,
              primaryColor: '#1976d2',
              secondaryColor: '#4a9eff'
            })
          ]
        });

        wavesurfer.current.on('finish', () => {
          setIsPlaying(false);
        });

        return () => {
          if (wavesurfer.current) {
            wavesurfer.current.destroy();
          }
          if (audioContext.current) {
            audioContext.current.close();
          }
        };
      } catch (err) {
        console.error('Failed to initialize WaveSurfer:', err);
        setError('Failed to initialize audio visualizer');
      }
    }
  }, []);

  useEffect(() => {
    if (wavesurfer.current && audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      wavesurfer.current.load(audioUrl);
    }
  }, [audioBlob, wavesurfer]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      // Initialize audio context for visualization
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      
      recorder.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        chunks.current = [];
        if (wavesurfer.current) {
          const audioUrl = URL.createObjectURL(blob);
          wavesurfer.current.load(audioUrl);
        }
        onStop(blob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      onStart();
      
      // Start timer
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
      
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerInterval.current);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) { // 60MB limit
        setError('File size exceeds 60MB limit');
        return;
      }
      const blob = new Blob([file], { type: file.type });
      if (wavesurfer.current) {
        const audioUrl = URL.createObjectURL(blob);
        wavesurfer.current.load(audioUrl);
      }
      onStop(blob);
    }
  };

  const togglePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
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
        <div id="timeline"></div>
      </div>

      {!isRecording && wavesurfer.current && (
        <button
          className={`playback-button ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlayback}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      )}

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