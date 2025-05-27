
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatsApi } from '../api/threats';
import { useState } from 'react';

export const useThreats = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['threats', page, limit],
    queryFn: () => threatsApi.getAll(page, limit).then(res => res.data),
    refetchInterval: 30000,
    staleTime: 10000,
  });
};

export const useThreat = (id: string) => {
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
    refetchInterval: 60000,
  });
};

export const useVoteThreat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (voteData: { threatId: string; vote: 'credible' | 'not_credible'; userId?: string }) => 
      threatsApi.vote(voteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};

export const useVerifyThreat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (verifyData: { threatId: string; sources: string[]; credibilityScore: number }) =>
      threatsApi.verify(verifyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};

export const useSimulate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (simulationData: { scenario: string }) =>
      threatsApi.simulate(simulationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
};

// Hook for paginated threats with load more functionality
export const usePaginatedThreats = () => {
  const [page, setPage] = useState(1);
  const [allThreats, setAllThreats] = useState<any[]>([]);
  const limit = 10;

  const query = useQuery({
    queryKey: ['threats', page, limit],
    queryFn: () => threatsApi.getAll(page, limit).then(res => res.data),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Accumulate threats when loading more
  React.useEffect(() => {
    if (query.data?.threats) {
      if (page === 1) {
        setAllThreats(query.data.threats);
      } else {
        setAllThreats(prev => [...prev, ...query.data.threats]);
      }
    }
  }, [query.data, page]);

  const loadMore = () => {
    if (query.data?.hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    setAllThreats([]);
    query.refetch();
  };

  return {
    threats: allThreats,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.data?.hasMore || false,
    total: query.data?.total || 0,
    loadMore,
    refresh
  };
};
