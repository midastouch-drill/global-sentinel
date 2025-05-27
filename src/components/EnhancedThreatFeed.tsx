
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EnhancedThreatCard from './EnhancedThreatCard';
import { AlertTriangle, Filter, RefreshCw, Clock, Globe, Search, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  timestamp: string;
  source: string;
  region?: string;
  regions?: string[];
  sources?: string[];
  status?: string;
  votes?: { credible: number; not_credible: number };
  confidence?: number;
}

interface EnhancedThreatFeedProps {
  threats: Threat[];
  isLoading?: boolean;
  hasMore?: boolean;
  total?: number;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onSimulate?: (threat: any) => void;
  onAnalyze?: (threat: any) => void;
  onVerify?: (threat: any) => void;
}

export const EnhancedThreatFeed = ({ 
  threats, 
  isLoading, 
  hasMore = false,
  total = 0,
  onRefresh, 
  onLoadMore,
  onSimulate,
  onAnalyze,
  onVerify
}: EnhancedThreatFeedProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const { toast } = useToast();

  const threatTypes = ['all', 'Cyber', 'Climate', 'Health', 'Economic', 'Conflict', 'AI'];

  // Show elegant loading message after a delay
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoadingMessage(true);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        setShowLoadingMessage(false);
      };
    } else {
      setShowLoadingMessage(false);
    }
  }, [isLoading]);

  const filteredThreats = threats
    .filter(threat => {
      const matchesType = filterType === 'all' || threat.type === filterType;
      const matchesSearch = !searchQuery || 
        threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (threat.regions && threat.regions.some(region => 
          region.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return b.severity - a.severity;
    });

  const criticalCount = threats.filter(t => t.severity >= 80).length;
  const highCount = threats.filter(t => t.severity >= 60 && t.severity < 80).length;

  const handleLoadMore = () => {
    setShowLoadingMessage(true);
    onLoadMore?.();
    
    toast({
      title: "📡 Loading Intelligence",
      description: "Fetching additional threat data from global sources...",
    });
  };

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
              Real-time monitoring • {total} sources active • {filteredThreats.length} displayed
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
              {isLoading ? 'Syncing...' : 'Refresh'}
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
            <div className="text-sm text-muted-foreground">Active Threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-green-400">
              {threats.length > 0 ? format(new Date(threats[0].timestamp), 'HH:mm') : '--:--'}
            </div>
            <div className="text-sm text-muted-foreground">Last Update</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-cyan-400" />
              <Input
                placeholder="Search threats, regions, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input max-w-md"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-muted-foreground mr-2">Filter:</span>
            {threatTypes.map((type) => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                className={`cyber-button ${
                  filterType === type 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' 
                    : ''
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
            
            <div className="ml-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Sort:</span>
              <Button
                onClick={() => setSortBy('timestamp')}
                variant={sortBy === 'timestamp' ? "default" : "outline"}
                size="sm"
                className="cyber-button"
              >
                Latest
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
          </div>
        </div>
      </motion.div>

      {/* Critical Threats Alert */}
      <AnimatePresence>
        {criticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="cyber-card p-4 border-2 border-red-500/50 bg-red-500/5"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-threat-pulse" />
              <h3 className="text-lg font-semibold text-red-400">
                {criticalCount} Critical Alert{criticalCount !== 1 ? 's' : ''}
              </h3>
              <Badge className="bg-red-500/20 text-red-400 border-red-500 animate-pulse">
                IMMEDIATE ATTENTION
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              High-severity threats requiring immediate analysis and response protocols
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State with Elegant Message */}
      <AnimatePresence>
        {isLoading && showLoadingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="cyber-card p-6 text-center"
          >
            <Loader2 className="w-8 h-8 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Synchronizing Global Intelligence
            </h3>
            <p className="text-sm text-muted-foreground">
              Connecting to satellite networks, processing SIGINT feeds, and analyzing threat patterns...
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-xs text-muted-foreground">
              <span>🛰️ Satellite Data</span>
              <span>📡 SIGINT Processing</span>
              <span>🧠 AI Analysis</span>
              <span>🔒 Security Verification</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threat Cards Grid */}
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
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
              <EnhancedThreatCard 
                threat={threat}
                onSimulate={onSimulate}
                onAnalyze={onAnalyze}
                onVerify={onVerify}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      <AnimatePresence>
        {hasMore && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Button 
              onClick={handleLoadMore}
              className="cyber-button"
              size="lg"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Load More Threats
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {threats.length} of {total} threats displayed
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredThreats.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No threats match current filters
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 
              `No results found for "${searchQuery}"` : 
              `No ${filterType} threats currently active`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};
