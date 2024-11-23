// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { uuidToBase62, base62ToUuid } from '../utils/base62';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'sing-a-song',
      'Access-Control-Allow-Origin': ['https://sing-a-song.netlify.app', 'http://localhost:5173']
    }
  }
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Storage bucket constants
const STORAGE_BUCKET = 'tracks';

// Helper function for storage operations
const getStorageClient = () => {
  return supabase.storage.from(STORAGE_BUCKET);
};

// Helper function to get base URL
const getBaseUrl = () => {
  const isProd = import.meta.env.PROD;
  return isProd ? 'https://sing-a-song.netlify.app' : 'http://localhost:5173';
};

// Storage operations helper functions
const storageHelpers = {
  // Upload a recording to Supabase
  uploadRecording: async (blob, recordingId, userId) => {
    try {
      // Convert M4A to MP3 if needed
      let uploadBlob = blob;
      const contentType = blob.type;
      
      if (contentType === 'audio/x-m4a') {
        // Create a new blob with MP3 mime type
        uploadBlob = new Blob([blob], { type: 'audio/mpeg' });
      }

      const filePath = `${userId}/${recordingId}${contentType === 'audio/x-m4a' ? '.mp3' : '.webm'}`;
      const { data, error } = await getStorageClient().upload(filePath, uploadBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType === 'audio/x-m4a' ? 'audio/mpeg' : contentType
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('\n Upload error: \n', error);
      throw error;
    }
  },

  // Delete a recording from Supabase
  deleteRecording: async (userId, recordingId) => {
    try {
      const filePath = `${userId}/${recordingId}.webm`;
      const { error } = await getStorageClient().remove([filePath]);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },

  // Get a recording's public URL
  getPublicUrl: (userId, recordingId) => {
    const filePath = `${userId}/${recordingId}.webm`;
    const { data: { publicUrl } } = getStorageClient().getPublicUrl(filePath);
    return publicUrl;
  },

  // Get recording by share token
  getSharedRecording: async (userId, recordingId) => {
    try {
      const filePath = `${userId}/${recordingId}.webm`;
      
      // First check if the file exists
      const { data: fileExists, error: existsError } = await getStorageClient()
        .download(filePath);

      if (existsError || !fileExists) {
        throw new Error('Recording not found');
      }

      // Get the public URL
      const { data: { publicUrl } } = getStorageClient().getPublicUrl(filePath);

      return {
        data: {
          id: recordingId,
          url: publicUrl,
          userId,
          filePath
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching shared recording:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch recording'
      };
    }
  },

  // Generate a share link
  generateShareLink: (userId, recordingId) => {
    const baseUrl = getBaseUrl();
    const shortUserId = uuidToBase62(userId);
    const shortRecordingId = uuidToBase62(recordingId);
    return `${baseUrl}/share/${shortUserId}/${shortRecordingId}`;
  },

  // Get original UUIDs from short IDs
  getOriginalIds: (shortUserId, shortRecordingId) => {
    return {
      userId: base62ToUuid(shortUserId),
      recordingId: base62ToUuid(shortRecordingId)
    };
  }
};

export { supabase, STORAGE_BUCKET, getStorageClient, storageHelpers };