
import React, { useState } from 'react';
import { useThreats } from '@/hooks/useThreats';
import DashboardHeader from './dashboard/DashboardHeader';
import ThreatStats from './dashboard/ThreatStats';
import DashboardControls from './dashboard/DashboardControls';
import ThreatGrid from './dashboard/ThreatGrid';
import ErrorState from './dashboard/ErrorState';

export const EnhancedThreatDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [displayCount, setDisplayCount] = useState(10);
  const { data: threatsResponse, isLoading, error, refetch } = useThreats();
  
  const threats = threatsResponse?.threats || [];
  const totalThreats = threatsResponse?.total || threats.length;

  // Filter threats
  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (typeof threat.type === 'string' && 
                        threat.type.toLowerCase() === filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  // Get threats to display
  const threatsToShow = filteredThreats.slice(0, displayCount);
  const hasMore = displayCount < filteredThreats.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, filteredThreats.length));
  };

  // Extract unique threat types with proper type checking
  const uniqueTypes = Array.from(new Set(
    threats
      .map(t => t.type)
      .filter((type): type is string => typeof type === 'string' && type.length > 0)
  ));
  
  const threatTypes: string[] = ['all', ...uniqueTypes];

  const criticalThreats = threats.filter(t => typeof t.severity === 'number' && t.severity >= 80).length;
  const highThreats = threats.filter(t => typeof t.severity === 'number' && t.severity >= 60 && t.severity < 80).length;
  const avgSeverity = threats.length > 0 ? Math.round(threats.reduce((sum, t) => sum + (typeof t.severity === 'number' ? t.severity : 0), 0) / threats.length) : 0;

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader threatCount={totalThreats} />
      
      <div className="cyber-card p-6">
        <ThreatStats
          criticalThreats={criticalThreats}
          highThreats={highThreats}
          totalThreats={totalThreats}
          avgSeverity={avgSeverity}
        />

        <DashboardControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          threatTypes={threatTypes}
          onRefresh={() => refetch()}
          isLoading={isLoading}
        />
      </div>

      <ThreatGrid
        threats={threatsToShow}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        searchTerm={searchTerm}
        filterType={filterType}
      />
    </div>
  );
};
