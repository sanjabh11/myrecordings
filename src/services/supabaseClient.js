import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdazoayglvhxhwngiafd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYXpvYXlnbHZoeGh3bmdpYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg2MjY5ODAsImV4cCI6MjAyNDIwMjk4MH0.0ZKFvOjZRoHDEsC7ZxVR4zNkGxhXqKM5c-x9IyG_qYY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Initialize storage bucket
const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const recordingsBucket = buckets?.find(b => b.name === 'recordings');

    if (!recordingsBucket) {
      await supabase.storage.createBucket('recordings', {
        public: true,
        fileSizeLimit: 60000000 // 60MB
      });
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initializeStorage();