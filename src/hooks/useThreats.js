
import { useQuery } from '@tanstack/react-query';
import { threatsApi } from '../api/threats.js';

export const useThreats = () => {
  return useQuery({
    queryKey: ['threats'],
    queryFn: () => threatsApi.getAll(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
