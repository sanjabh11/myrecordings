// Audio file validation
export const validateAudioFile = (file) => {
  const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a'];
  const maxSize = 60 * 1024 * 1024; // 60MB in bytes

  if (!file) return { valid: false, error: 'No file selected' };
  
  // Check file type
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload MP3, WAV, or M4A files only.' };
  }

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 60MB limit' };
  }

  return { valid: true, error: null };
};

// Recording duration validation
export const validateRecordingDuration = (duration) => {
  const maxDuration = 120; // 2 minutes in seconds
  
  if (duration > maxDuration) {
    return { valid: false, error: 'Recording exceeds maximum duration of 2 minutes' };
  }
  
  return { valid: true, error: null };
};

// Anonymous storage validation
export const checkStorageQuota = async () => {
  try {
    const estimate = await navigator.storage.estimate();
    const quotaPercentage = (estimate.usage / estimate.quota) * 100;
    
    return {
      available: quotaPercentage < 90,
      percentageUsed: quotaPercentage,
      error: null
    };
  } catch (error) {
    return {
      available: false,
      percentageUsed: null,
      error: 'Unable to check storage quota'
    };
  }
}; 