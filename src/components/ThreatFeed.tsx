
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ThreatCard from './ThreatCard';
import { AlertTriangle, Filter, RefreshCw, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  timestamp: string;
  source: string;
  region?: string;
}

interface ThreatFeedProps {
  threats: Threat[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ThreatFeed = ({ threats, isLoading, onRefresh }: ThreatFeedProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');

  const threatTypes = ['all', 'Cyber', 'Climate', 'Health', 'Economic', 'Conflict', 'AI'];

  const filteredThreats = threats
    .filter(threat => filterType === 'all' || threat.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return b.severity - a.severity;
    });

  const criticalCount = threats.filter(t => t.severity >= 80).length;
  const highCount = threats.filter(t => t.severity >= 60 && t.severity < 80).length;

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Globe className="w-8 h-8 mr-3 animate-pulse-glow" />
              Global Threat Intelligence Feed
            </h2>
            <p className="text-muted-foreground">
              Real-time threat monitoring from {threats.length} active sources
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              className="cyber-button"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-mono text-red-400">
              {criticalCount}
            </div>
            <div className="text-sm text-muted-foreground">Critical Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-orange-400">
              {highCount}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-cyan-400">
              {threats.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-green-400">
              {threats.length > 0 ? format(new Date(threats[0].timestamp), 'HH:mm') : '--:--'}
            </div>
            <div className="text-sm text-muted-foreground">Last Update</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-muted-foreground mr-2">Filter by type:</span>
          {threatTypes.map((type) => (
            <Button
              key={type}
              onClick={() => setFilterType(type)}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              className={`${
                filterType === type 
                  ? 'cyber-button bg-cyan-500/20 text-cyan-400 border-cyan-500' 
                  : 'cyber-button'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
          <Button
            onClick={() => setSortBy('timestamp')}
            variant={sortBy === 'timestamp' ? "default" : "outline"}
            size="sm"
            className="cyber-button"
          >
            Latest First
          </Button>
          <Button
            onClick={() => setSortBy('severity')}
            variant={sortBy === 'severity' ? "default" : "outline"}
            size="sm"
            className="cyber-button"
          >
            Severity
          </Button>
        </div>
      </motion.div>

      {/* Critical Threats Alert */}
      <AnimatePresence>
        {criticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="threat-card p-4 border-2 border-red-500/50"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-threat-pulse" />
              <h3 className="text-lg font-semibold text-red-400">
                {criticalCount} Critical Threat{criticalCount !== 1 ? 's' : ''} Detected
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Immediate attention required for threats with severity ≥ 80
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threat Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredThreats.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <ThreatCard 
                threat={threat} 
                priority={threat.severity >= 80 ? 'critical' : 'normal'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredThreats.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No threats match your filters
          </h3>
          <p className="text-sm text-muted-foreground">
            {filterType === 'all' 
              ? 'All clear! No active threats detected.' 
              : `No ${filterType} threats currently active.`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};
