
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatsApi } from '../api/threats';

export const useThreats = (page = 1, limit = 50) => {
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
    mutationFn: (verifyData: { threatId?: string; claim: string; userId?: string }) =>
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

// Enhanced hook for paginated threats with load more functionality
export const usePaginatedThreats = (initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [displayLimit, setDisplayLimit] = useState(initialLimit);
  const [allThreats, setAllThreats] = useState<any[]>([]);

  const query = useQuery({
    queryKey: ['threats', 1, 50], // Always fetch 50 from backend
    queryFn: () => threatsApi.getAll(1, 50).then(res => res.data),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Update threats when data changes
  React.useEffect(() => {
    if (query.data?.threats) {
      setAllThreats(query.data.threats);
    }
  }, [query.data]);

  const displayedThreats = allThreats.slice(0, displayLimit);
  const hasMore = displayLimit < allThreats.length;

  const loadMore = () => {
    setDisplayLimit(prev => Math.min(prev + 10, allThreats.length));
  };

  const refresh = () => {
    setDisplayLimit(initialLimit);
    query.refetch();
  };

  return {
    threats: displayedThreats,
    allThreats,
    isLoading: query.isLoading,
    error: query.error,
    hasMore,
    total: allThreats.length,
    loadMore,
    refresh
  };
};
