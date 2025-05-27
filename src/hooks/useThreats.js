import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatsApi } from '../api/threats.js';

export const useThreats = () => {
  return useQuery({
    queryKey: ['threats'],
    queryFn: () => threatsApi.getAll().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
};

export const useThreat = (id) => {
  return useQuery({
    queryKey: ['threat', id],
    queryFn: () => threatsApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useTrends = () => {
  return useQuery({
    queryKey: ['trends'],
    queryFn: () => threatsApi.getTrends().then(res => res.data),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useVoteThreat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: threatsApi.vote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};

export const useVerifyThreat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: threatsApi.verify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};

export const useSimulate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: threatsApi.simulate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};