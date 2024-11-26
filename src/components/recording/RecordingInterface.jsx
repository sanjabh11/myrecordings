import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaExclamationTriangle, FaUpload } from 'react-icons/fa';
import './RecordingInterface.css';

const RecordingInterface = ({ 
  isRecording,
  onStart,
  onStop,
  onPermissionChange,
  disabled,
  error: externalError
}) => {
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const mediaStream = useRef(null);
  const animationFrame = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      stopRecording();
      cleanupAudio();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const cleanupAudio = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    if (analyser.current) {
      try {
        analyser.current.disconnect();
      } catch (e) {
        // Ignore disconnection errors
      }
    }

    if (audioContext.current) {
      audioContext.current.close().catch(console.error);
      audioContext.current = null;
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      if (onPermissionChange) onPermissionChange(true);
    } catch (err) {
      console.error('Microphone permission error:', err);
      setHasPermission(false);
      setError('Microphone access denied. Please allow microphone access to record.');
      if (onPermissionChange) onPermissionChange(false);
    }
  };

  const initializeAudioContext = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }
    }
    return audioContext.current;
  };

  const initializeCanvas = () => {
    if (canvasRef.current && !canvasCtxRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      const rect = canvasRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    }
  };

  const drawWaveform = (analyserNode, dataArray) => {
    if (!canvasRef.current || !canvasCtxRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvasCtxRef.current;
    
    analyserNode.getByteFrequencyData(dataArray);
    
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = dataArray.length;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate bar dimensions
    const barWidth = width / bufferLength * 2.5;
    const barSpacing = 1;
    const multiplier = height / 256;
    
    // Create bar gradient
    const barGradient = ctx.createLinearGradient(0, height, 0, 0);
    barGradient.addColorStop(0, '#4A90E2');
    barGradient.addColorStop(0.5, '#357ABD');
    barGradient.addColorStop(1, '#4A90E2');
    ctx.fillStyle = barGradient;

    // Draw frequency bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] * multiplier;
      const x = i * (barWidth + barSpacing);
      const y = height / 2 - barHeight / 2;
      
      // Draw mirrored bars
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fillRect(x, height/2, barWidth, barHeight/2);
    }

    if (isRecording || isPlaying) {
      animationFrame.current = requestAnimationFrame(() => drawWaveform(analyserNode, dataArray));
    }
  };

  const visualizeStoredAudio = async (audioElement) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      // Reset any existing connections
      if (analyser.current) {
        try {
          analyser.current.disconnect();
        } catch (e) {
          // Ignore disconnection errors
        }
      }

      // Create new analyzer
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;

      // Create and connect source
      let source;
      try {
        source = audioContext.current.createMediaElementSource(audioElement);
      } catch (e) {
        // If source is already created, get the existing source
        const existingSources = audioContext.current.getSources?.() || [];
        source = existingSources.find(s => s.mediaElement === audioElement);
        if (!source) throw e;
      }

      source.connect(analyser.current);
      analyser.current.connect(audioContext.current.destination);

      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      
      const updateWaveform = () => {
        if (!isPlaying) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        drawWaveform(analyser.current, dataArray);
        animationFrame.current = requestAnimationFrame(updateWaveform);
      };
      
      updateWaveform();
    } catch (err) {
      console.error('Error visualizing stored audio:', err);
    }
  };

  useEffect(() => {
    initializeCanvas();
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      visualizeStoredAudio(audioRef.current).catch(console.error);
    }
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  useEffect(() => {
    if (isRecording && hasPermission) {
      startRecording();
    } else if (!isRecording && mediaRecorder?.state === 'recording') {
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      cleanupAudio();
      chunks.current = []; // Reset chunks at start
      
      const context = await initializeAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      // Set up audio nodes with improved analysis
      const source = context.createMediaStreamSource(stream);
      analyser.current = context.createAnalyser();
      analyser.current.fftSize = 256; // Reduced for better performance and visualization
      analyser.current.smoothingTimeConstant = 0.8; // Smooth transitions
      source.connect(analyser.current);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunks.current.length > 0) {
          const blob = new Blob(chunks.current, { type: 'audio/webm;codecs=opus' });
          if (onStop) onStop(blob);
        }
        cleanupAudio();
      };

      setMediaRecorder(recorder);
      recorder.start(100); // Record in 100ms chunks
      startTimer();

      // Start visualization with improved settings
      drawWaveform(analyser.current, dataArray);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please check your microphone.');
      if (onStop) onStop(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      stopTimer();
    }
    cleanupAudio();
  };

  const startTimer = () => {
    setTimer(0);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordClick = () => {
    if (!hasPermission) {
      checkMicrophonePermission();
      return;
    }
    
    if (disabled) {
      return;
    }

    if (!isRecording) {
      onStart();
    } else {
      stopRecording();
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
      if (onStop) onStop(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return (
    <div className="recording-interface p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center gap-4">
        {(error || externalError) && (
          <div className="error-message flex items-center gap-2 text-red-600 mb-4">
            <FaExclamationTriangle />
            <span>{error || externalError}</span>
          </div>
        )}

        <div className="timer text-4xl font-bold mb-4">
          {isPlaying ? `${formatTime(audioTime)} / ${formatTime(audioDuration)}` : `${formatTime(timer)} / 2:00`}
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            className={`record-button p-6 rounded-full transition-all transform hover:scale-105 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary-dark'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleRecordClick}
            disabled={disabled || (isRecording && timer >= 120)}
          >
            {isRecording ? (
              <FaStop className="text-white text-3xl" />
            ) : (
              <FaMicrophone className="text-white text-3xl" />
            )}
          </button>

          <div className="text-sm text-gray-500">
            {isRecording
              ? 'Click to stop recording'
              : hasPermission
              ? 'Click to start recording'
              : 'Click to enable microphone'}
          </div>

          {!isRecording && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-gray-400">OR</div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <FaUpload />
                <span>Upload Audio File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  disabled={disabled}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500">
                MP3/WAV/M4A/AAC formats, 60MB limit
              </div>
            </div>
          )}
        </div>

        {disabled && (
          <div className="text-sm text-red-500 mt-2">
            Recording limit reached. Please delete some recordings or upgrade to premium.
          </div>
        )}
      </div>

      <div className="waveform-container mt-6">
        <canvas 
          ref={canvasRef}
          className="waveform w-full h-24 bg-gray-50 rounded-lg"
          width={800}
          height={100}
        />
      </div>

      {audioUrl && !isRecording && (
        <div className="mt-6">
          <audio
            ref={audioRef}
            controls
            className="w-full"
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setAudioTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default RecordingInterface;