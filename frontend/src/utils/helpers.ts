import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return '';
  }
};

export const formatDateTimeLocal = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
};

export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'critical':
      return '#dc2626';
    case 'high':
      return '#ea580c';
    case 'medium':
      return '#ca8a04';
    case 'low':
      return '#16a34a';
    default:
      return '#6b7280';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return '#16a34a';
    case 'in progress':
      return '#2563eb';
    case 'todo':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};