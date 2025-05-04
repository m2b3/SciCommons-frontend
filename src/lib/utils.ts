import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === null || bytes === undefined) return '0 B';
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Invalid size';

  const units = ['B', 'KB', 'MB', 'GB'];
  const base = 1024;
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));

  // Ensure we don't exceed available units
  const maxUnitIndex = Math.min(unitIndex, units.length - 1);
  const value = bytes / Math.pow(base, maxUnitIndex);

  // Round to 2 decimal places
  return `${value.toFixed(2)} ${units[maxUnitIndex]}`;
};
