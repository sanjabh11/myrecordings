import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'recordnow_anonymous_storage';
const MAX_RECORDINGS = 10;
const RETENTION_DAYS = 30;
const DB_NAME = 'recordnow_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

export const useAnonymousStorage = () => {
  const [recordings, setRecordings] = useState([]);
  const [anonymousId, setAnonymousId] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [db, setDb] = useState(null);

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      setStorageError('Failed to initialize storage');
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      setDb(event.target.result);
      loadRecordings(event.target.result);
    };
  }, []);

  const loadRecordings = async (database) => {
    try {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const loadedRecordings = request.result;
        setRecordings(loadedRecordings);
        cleanupExpiredRecordings(loadedRecordings, database);
      };
    } catch (err) {
      console.error('Error loading recordings:', err);
    }
  };

  const cleanupExpiredRecordings = (currentRecordings, database) => {
    const currentDate = new Date();
    const updatedRecordings = currentRecordings.filter(recording => {
      const expiryDate = new Date(recording.expiresAt);
      return expiryDate > currentDate;
    });

    if (updatedRecordings.length !== currentRecordings.length) {
      setRecordings(updatedRecordings);
      saveToStorage(updatedRecordings, database);
    }
  };

  const saveToStorage = async (updatedRecordings, database = db) => {
    try {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Clear existing records
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = resolve;
        clearRequest.onerror = reject;
      });

      // Add new records
      for (const recording of updatedRecordings) {
        await new Promise((resolve, reject) => {
          const request = store.add(recording);
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      }

      setStorageError(null);
    } catch (err) {
      console.error('Storage error:', err);
      throw new Error('Failed to save recordings');
    }
  };

  const addRecording = async (blob, metadata = {}) => {
    if (recordings.length >= MAX_RECORDINGS) {
      throw new Error('Recording limit reached (10 recordings maximum)');
    }

    try {
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + RETENTION_DAYS);

      const newRecording = {
        id: uuidv4(),
        audioData: base64data,
        createdAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
        size: blob.size,
        ...metadata
      };

      const updatedRecordings = [...recordings, newRecording];
      await saveToStorage(updatedRecordings);
      setRecordings(updatedRecordings);
      return newRecording;
    } catch (err) {
      console.error('Storage error:', err);
      throw new Error('Failed to save recording. Please try again.');
    }
  };

  const getRecordingBlob = (recording) => {
    if (!recording || !recording.audioData) return null;
    
    try {
      const base64Response = recording.audioData;
      const byteCharacters = atob(base64Response.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'audio/webm' });
    } catch (err) {
      console.error('Error converting recording to blob:', err);
      return null;
    }
  };

  const deleteRecording = async (recordingId) => {
    try {
      const updatedRecordings = recordings.filter(rec => rec.id !== recordingId);
      await saveToStorage(updatedRecordings);
      setRecordings(updatedRecordings);
    } catch (err) {
      console.error('Error deleting recording:', err);
      throw new Error('Failed to delete recording');
    }
  };

  const getRecordingCount = () => recordings.length;

  return {
    recordings,
    addRecording,
    deleteRecording,
    getRecordingCount,
    getRecordingBlob,
    anonymousId,
    storageError
  };
}; 