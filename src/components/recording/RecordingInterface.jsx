import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const RecordingInterface = ({ 
  isRecording, 
  setIsRecording, 
  onRecordingComplete,
  recordingCount 
}) => {
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    // Initialize WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'var(--primary-color)',
      progressColor: 'var(--secondary-color)',
      cursorWidth: 1,
      height: 80,
    });

    return () => wavesurfer.current.destroy();
  }, []);

  const startRecording = async () => {
    if (recordingCount >= 10) {
      setError('Recording limit reached. Please upgrade to premium for unlimited recordings.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        chunks.current = [];
        onRecordingComplete(blob);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to record.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      stopTimer();
      setIsRecording(false);
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

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Update valid file types to include AAC
    const validTypes = ['.mp3', '.wav', '.m4a', '.aac'];
    const fileType = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    // Update MIME types to include AAC
    const validMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/x-m4a',
      'audio/mp3',
      'audio/wave',
      'audio/aac',
      'audio/x-aac',
      'audio/aacp'
    ];

    if (!validTypes.includes(fileType) && !validMimeTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP3, WAV, M4A, or AAC files only.');
      event.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (60MB limit)
    const MAX_SIZE = 60 * 1024 * 1024; // 60MB in bytes
    if (file.size > MAX_SIZE) {
      setError('File size exceeds 60MB limit.');
      return;
    }

    try {
      // Create audio element to check duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration > 120) { // 2 minutes limit
          setError('Audio duration exceeds 2 minutes limit.');
          return;
        }

        // Convert file to blob and handle as recording
        const reader = new FileReader();
        reader.onload = async (e) => {
          const blob = new Blob([e.target.result], { type: file.type });
          onRecordingComplete(blob);
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      setError('Error processing audio file. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = { target: { files: files } };
      handleFileUpload(event);
    }
  };

  return (
    <div className="recording-options">
      <section className="record-section">
        <h2>START RECORDING</h2>
        <button 
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={recordingCount >= 10}
        >
          <i className="microphone-icon"></i>
        </button>
        <div className="timer">
          {formatTime(timer)}/02:00
        </div>
        {error && <div className="error-message">{error}</div>}
      </section>

      <div ref={waveformRef} className="waveform"></div>

      <section className="upload-section">
        <h2>OR</h2>
        <div 
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h3>SELECT AUDIO FILE</h3>
          <p>DROP YOUR MP3/WAV/M4A/AAC HERE. 60MB LIMIT</p>
          <input 
            type="file" 
            accept="audio/mpeg,audio/wav,audio/x-m4a,audio/aac,audio/x-aac,.mp3,.wav,.m4a,.aac"
            onChange={handleFileUpload}
          />
        </div>
      </section>
    </div>
  );
};

export default RecordingInterface; 