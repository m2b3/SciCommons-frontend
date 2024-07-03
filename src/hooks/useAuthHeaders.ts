import { useAuthStore } from '@/stores/authStore';

export const useAuthHeaders = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
};
