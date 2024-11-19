// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkhvucynanvnjtiztdnl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Storage bucket constants
export const STORAGE_BUCKET = 'tracks';

// Helper function for storage operations
export const getStorageClient = () => {
  return supabase.storage.from(STORAGE_BUCKET);
};

// Storage operations helper functions
export const storageHelpers = {
  // Upload a recording
  uploadRecording: async (blob, fileName, userId) => {
    try {
      const filePath = `${userId}/${fileName}`;
      const { data, error } = await getStorageClient()
        .upload(filePath, blob, {
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

export default supabase;