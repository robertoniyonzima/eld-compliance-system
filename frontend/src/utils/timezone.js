// Timezone utilities for ELD Compliance System
// Rwanda timezone: UTC+2 (Africa/Kigali)

/**
 * Get current local time in ISO format WITHOUT timezone conversion
 * This ensures the time sent to backend matches what user sees
 */
export const getLocalISOString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Format: YYYY-MM-DDTHH:MM:SS (no timezone, treated as local)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Format a date object to local ISO string
 */
export const toLocalISOString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Parse a datetime string from backend (assumed to be in local timezone)
 * Returns a Date object
 */
export const parseLocalDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  // If it has 'Z' or timezone info, remove it
  const cleanString = dateTimeString.replace('Z', '').split('+')[0].split('-').slice(0, 3).join('-');
  
  return new Date(cleanString);
};

/**
 * Format time for display (HH:MM AM/PM)
 */
export const formatTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Format time for 24-hour display (HH:MM)
 */
export const formatTime24 = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Calculate duration between two datetime strings in hours
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return (end - start) / (1000 * 60 * 60); // hours
};

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export const getTimeAgo = (dateTimeString) => {
  if (!dateTimeString) return 'Unknown';
  
  const date = new Date(dateTimeString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export default {
  getLocalISOString,
  toLocalISOString,
  parseLocalDateTime,
  formatTime,
  formatTime24,
  getTodayDateString,
  calculateDuration,
  getTimeAgo
};
