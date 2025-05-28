
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Filter,
  Search,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useThreats } from '@/hooks/useThreats';
import ThreatCard from './ThreatCard';
import { motion, AnimatePresence } from 'framer-motion';

export const EnhancedThreatDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(10);
  const { data: threatsResponse, isLoading, error, refetch } = useThreats();
  
  const threats = threatsResponse?.threats || [];
  const totalThreats = threatsResponse?.total || threats.length;

  // Filter threats
  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || threat.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Get threats to display
  const threatsToShow = filteredThreats.slice(0, displayCount);
  const hasMore = displayCount < filteredThreats.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, filteredThreats.length));
  };

  const threatTypes = ['all', ...Array.from(new Set(threats.map(t => t.type)))];

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400';
    if (severity >= 60) return 'text-orange-400';
    if (severity >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const criticalThreats = threats.filter(t => t.severity >= 80).length;
  const highThreats = threats.filter(t => t.severity >= 60 && t.severity < 80).length;
  const avgSeverity = threats.length > 0 ? Math.round(threats.reduce((sum, t) => sum + t.severity, 0) / threats.length) : 0;

  if (error) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-400 mb-2">Intelligence System Error</h3>
            <p className="text-muted-foreground mb-4">Failed to connect to threat intelligence network</p>
            <Button onClick={() => refetch()} className="cyber-button">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 neon-text">Global Threat Intelligence</h1>
            <p className="text-muted-foreground">Real-time crisis monitoring and threat assessment</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-mono">LIVE</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
            <div className="text-2xl font-mono text-red-400">{criticalThreats}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-orange-500/30">
            <div className="text-2xl font-mono text-orange-400">{highThreats}</div>
            <div className="text-sm text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
            <div className="text-2xl font-mono text-cyan-400">{totalThreats}</div>
            <div className="text-sm text-muted-foreground">Total Active</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30">
            <div className={`text-2xl font-mono ${getSeverityColor(avgSeverity)}`}>{avgSeverity}</div>
            <div className="text-sm text-muted-foreground">Avg Severity</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search threats, regions, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900/50 border border-cyan-500/30 rounded px-3 py-2 text-sm text-cyan-400"
            >
              {threatTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="cyber-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Threat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {threatsToShow.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ThreatCard
                threat={threat}
                priority={threat.severity >= 80 ? 'critical' : 'normal'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="cyber-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="text-center">
          <Button 
            onClick={loadMore} 
            variant="outline" 
            className="cyber-button"
          >
            <Eye className="w-4 h-4 mr-2" />
            Load More Threats ({filteredThreats.length - displayCount} remaining)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && threatsToShow.length === 0 && (
        <Card className="cyber-card">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Threats Found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'All quiet on the intelligence front'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
