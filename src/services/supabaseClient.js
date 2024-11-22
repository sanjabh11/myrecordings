// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkhvucynanvnjtiztdnl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Storage bucket constants
const STORAGE_BUCKET = 'tracks';

// Helper function for storage operations
const getStorageClient = () => {
  return supabase.storage.from(STORAGE_BUCKET);
};

// Storage operations helper functions
const storageHelpers = {
  // Upload a recording
  uploadRecording: async (blob, fileName, userId) => {
    try {
      const filePath = `${userId}/${fileName}`;
      const { data, error } = await getStorageClient()
        .upload(filePath, blob, {
          contentType: 'audio/webm; codecs=opus',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { filePath, data };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Delete a recording
  deleteRecording: async (filePath) => {
    try {
      const { error } = await getStorageClient().remove([filePath]);
      if (error) throw error;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },

  // Get a public URL for a recording
  getPublicUrl: (filePath) => {
    return getStorageClient().getPublicUrl(filePath);
  }
};

export { supabase, STORAGE_BUCKET, getStorageClient, storageHelpers };