import { useAuthStore } from '@/stores/authStore';

// NOTE(bsureshkrishna, 2026-02-07): Shared helper to standardize bearer headers
// across API calls (introduced after baseline 5271498).
export const useAuthHeaders = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  if (!accessToken) {
    return {};
  }

  return {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
};
