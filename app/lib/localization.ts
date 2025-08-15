/**
 * Localization utilities for Ghana-based business
 * Currency: Ghana Cedi (GHS)
 * Timezone: Africa/Accra
 */

// Ghana Cedi currency formatter
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₵0.00';
  }

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Ghana Cedi currency formatter without symbol (just the amount)
export const formatAmount = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Ghana Cedi currency formatter with symbol
export const formatGHS = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₵0.00';
  }

  return `₵${formatAmount(numAmount)}`;
};

// Date formatter for Africa/Accra timezone
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-GH', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

// Date and time formatter for Africa/Accra timezone
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-GH', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Relative time formatter (e.g., "2 days ago", "in 3 hours")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
  } else if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} ago`;
  } else if (diffInHours > 0) {
    return `in ${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
  } else if (diffInHours < 0) {
    return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes > 0) {
    return `in ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`;
  } else if (diffInMinutes < 0) {
    return `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) === 1 ? '' : 's'} ago`;
  } else {
    return 'now';
  }
};

// Phone number formatter for Ghana (+233)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with +233
  if (digits.startsWith('0')) {
    return `+233${digits.substring(1)}`;
  }
  
  // If it starts with 233, add +
  if (digits.startsWith('233')) {
    return `+${digits}`;
  }
  
  // If it's already in international format, return as is
  if (digits.startsWith('233')) {
    return `+${digits}`;
  }
  
  // Default: assume it's a local number and add +233
  return `+233${digits}`;
};

// Address formatter for Ghana
export const formatAddress = (address: string): string => {
  // Ensure proper capitalization for common Ghanaian locations
  const commonLocations = [
    'accra', 'kumasi', 'tamale', 'tema', 'takoradi', 'cape coast', 'sunyani', 'ho', 'wa', 'bolgatanga'
  ];
  
  let formattedAddress = address;
  
  commonLocations.forEach(location => {
    const regex = new RegExp(`\\b${location}\\b`, 'gi');
    formattedAddress = formattedAddress.replace(regex, location.charAt(0).toUpperCase() + location.slice(1));
  });
  
  return formattedAddress;
};
