import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'recordnow_anonymous_storage';
const MAX_RECORDINGS = 10;
const RETENTION_DAYS = 30;
const DB_NAME = 'recordnow_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

const useAnonymousStorage = () => {
  const [recordings, setRecordings] = useState([]);
  const [storageError, setStorageError] = useState(null);
  const [db, setDb] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    let mounted = true;
    
    const initDB = () => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        setStorageError('Failed to initialize storage');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        if (!mounted) return;
        const database = event.target.result;
        setDb(database);
        loadRecordings(database);
        setIsInitialized(true);
      };
    };

    initDB();
    return () => {
      mounted = false;
      if (db) {
        db.close();
      }
    };
  }, []);

  const loadRecordings = async (database) => {
    if (!database) return;

    try {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const loadedRecordings = request.result || [];
        const currentDate = new Date();
        
        // Filter out expired recordings
        const validRecordings = loadedRecordings.filter(recording => {
          if (!recording.expiresAt) return false;
          const expiryDate = new Date(recording.expiresAt);
          return expiryDate > currentDate;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (loadedRecordings.length !== validRecordings.length) {
          // Clean up expired recordings
          saveToStorage(validRecordings, database);
        } else {
          setRecordings(validRecordings);
        }
        
        console.log('Valid recordings loaded:', validRecordings.length);
      };

      request.onerror = () => {
        console.error('Error loading recordings:', request.error);
        setStorageError('Failed to load recordings');
      };
    } catch (err) {
      console.error('Error in loadRecordings:', err);
      setStorageError('Failed to load recordings');
    }
  };

  const saveToStorage = async (updatedRecordings, database = db) => {
    if (!database) return;

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

      setRecordings(updatedRecordings);
      setStorageError(null);
      console.log('Saved recordings:', updatedRecordings.length);
    } catch (err) {
      console.error('Storage error:', err);
      setStorageError('Failed to save recordings');
      throw new Error('Failed to save recordings');
    }
  };

  const addRecording = async (blob, metadata = {}) => {
    if (!db || !isInitialized) {
      throw new Error('Storage not initialized');
    }

    const currentDate = new Date();
    const validRecordings = recordings.filter(recording => {
      const expiryDate = new Date(recording.expiresAt);
      return expiryDate > currentDate;
    });

    if (validRecordings.length >= MAX_RECORDINGS) {
      throw new Error(`Recording limit reached (${MAX_RECORDINGS} recordings maximum)`);
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
        name: `Recording ${validRecordings.length + 1}`,
        createdAt: currentDate.toISOString(),
        expiresAt: expiryDate.toISOString(),
        size: blob.size,
        ...metadata
      };

      const updatedRecordings = [...validRecordings, newRecording].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      await saveToStorage(updatedRecordings);
      return newRecording;
    } catch (err) {
      console.error('Error adding recording:', err);
      throw new Error('Failed to save recording');
    }
  };

  const deleteRecording = async (recordingId) => {
    if (!db || !isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      const updatedRecordings = recordings.filter(r => r.id !== recordingId);
      await saveToStorage(updatedRecordings);
    } catch (err) {
      console.error('Error deleting recording:', err);
      throw new Error('Failed to delete recording');
    }
  };

  const clearAllRecordings = async () => {
    if (!db || !isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      await saveToStorage([]);
    } catch (err) {
      console.error('Error clearing recordings:', err);
      throw new Error('Failed to clear recordings');
    }
  };

  const getRecordingBlob = async (recordingId) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (!recording || !recording.audioData) {
      throw new Error('Recording not found');
    }

    try {
      // Convert base64 to blob
      const response = await fetch(recording.audioData);
      return await response.blob();
    } catch (err) {
      console.error('Error getting recording blob:', err);
      throw new Error('Failed to load recording data');
    }
  };

  return {
    recordings,
    addRecording,
    deleteRecording,
    clearAllRecordings,
    getRecordingBlob,
    storageError,
    isInitialized
  };
};

export default useAnonymousStorage;