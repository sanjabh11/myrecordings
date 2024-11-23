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
      const { error } = await getStorageClient().remove([`${userId}/${recordingId}.webm`]);
      if (error) throw error;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  },

  // Get a list of recordings for a user
  listRecordings: async (userId) => {
    try {
      const { data, error } = await getStorageClient().list(userId + '/');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('List error:', error);
      throw error;
    }
  },

  // Get a shared recording URL
  getSharedRecordingUrl: async (userId, recordingId) => {
    try {
      // Try both .webm and .mp3 extensions
      const extensions = ['.webm', '.mp3'];
      let url = null;

      for (const ext of extensions) {
        const filePath = `${userId}/${recordingId}${ext}`;
        console.log('Trying path:', filePath);
        
        // Check if the file exists
        const { data: files } = await getStorageClient().list(userId + '/', {
          search: recordingId + ext
        });

        if (files && files.length > 0) {
          const { data } = getStorageClient().getPublicUrl(filePath);
          url = data.publicUrl;
          console.log('Found URL:', url);
          break;
        }
      }

      if (!url) {
        console.error('Recording not found for:', { userId, recordingId });
        throw new Error('Recording not found');
      }

      return url;
    } catch (error) {
      console.error('Error getting shared recording URL:', error);
      throw error;
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
    try {
      console.log('Converting IDs:', { shortUserId, shortRecordingId });
      const originalIds = {
        userId: base62ToUuid(shortUserId),
        recordingId: base62ToUuid(shortRecordingId)
      };
      console.log('Original IDs:', originalIds);
      return originalIds;
    } catch (error) {
      console.error('Error converting IDs:', error);
      throw error;
    }
  }
};

export { supabase, STORAGE_BUCKET, getStorageClient, storageHelpers };