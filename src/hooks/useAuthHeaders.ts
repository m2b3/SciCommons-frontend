import { useAuthStore } from '@/stores/authStore';

export const useAuthHeaders = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  if (!accessToken) {
    return {};
  }

  return {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
};
