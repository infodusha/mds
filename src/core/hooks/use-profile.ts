import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/core/api';

export function useProfile() {
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoggedIn = !!query.data?.email;

  return {
    profile: query.data,
    isLoggedIn,
    isProfileLoaded: query.isSuccess,
    refetchProfile: query.refetch,
  };
}
