// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

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
      const fileName = `${recordingId}.webm`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await getStorageClient()
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = getStorageClient().getPublicUrl(filePath);

      return {
        filePath,
        publicUrl,
        data
      };
    } catch (error) {
      console.error('Upload error:', error);
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
    return `${baseUrl}/share/${userId}/${recordingId}`;
  }
};

export { supabase, STORAGE_BUCKET, getStorageClient, storageHelpers };