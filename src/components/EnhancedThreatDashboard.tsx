
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  AlertTriangle, 
  Brain, 
  Zap, 
  Filter,
  Search,
  Grid,
  List,
  Activity,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useThreats } from '../hooks/useThreats';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedThreatCard from './EnhancedThreatCard';
import RealTimeAnalytics from './RealTimeAnalytics';
import SimulationLab from './SimulationLab';

export const EnhancedThreatDashboard = () => {
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const { toast } = useToast();

  const { 
    data: threatsResponse, 
    isLoading, 
    refetch,
    error 
  } = useThreats();

  const threats = threatsResponse?.threats || [];

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "🔍 Threat Database Synchronized",
        description: `Updated ${threats.length} active threats from global intelligence sources`,
      });
    } catch (error) {
      toast({
        title: "❌ Synchronization Failed",
        description: "Unable to connect to Global Sentinel Core. Check backend connection.",
        variant: "destructive",
      });
    }
  };

  const handleSimulate = (threat: any) => {
    setSelectedThreat(threat);
    setShowSimulation(true);
  };

  const handleAnalyze = (threat: any) => {
    // Navigate to simulation lab with pre-filled threat data
    console.log('Analyzing threat:', threat);
  };

  // Filter and sort threats
  const filteredThreats = threats
    .filter(threat => {
      const matchesType = filterType === 'all' || threat.type === filterType;
      const matchesSearch = !searchQuery || 
        threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        threat.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'severity') {
        return b.severity - a.severity;
      }
      return 0;
    });

  const criticalThreats = threats.filter(t => t.severity >= 80);
  const threatTypes = ['all', 'Cyber', 'Health', 'Climate', 'Economic', 'Conflict', 'AI'];

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Global Sentinel Core Disconnected
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to establish secure connection to threat intelligence backend
        </p>
        <Button onClick={handleRefresh} className="cyber-button">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-cyan-400 neon-text mb-2">
              Global Threat Detection System
            </h2>
            <p className="text-muted-foreground">
              Real-time AI-powered threat analysis with community validation
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="cyber-button"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
            
            <Button 
              onClick={() => setShowSimulation(true)}
              className="cyber-button bg-purple-600/20 text-purple-400 border-purple-500 hover:bg-purple-600/30"
            >
              <Brain className="w-4 h-4 mr-2" />
              Simulation Lab
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 cyber-card border border-red-500/50">
            <div className="text-3xl font-mono text-red-400 mb-1">
              {criticalThreats.length}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-4 cyber-card">
            <div className="text-3xl font-mono text-orange-400 mb-1">
              {threats.filter(t => t.severity >= 60 && t.severity < 80).length}
            </div>
            <div className="text-xs text-muted-foreground">High</div>
          </div>
          <div className="text-center p-4 cyber-card">
            <div className="text-3xl font-mono text-cyan-400 mb-1">
              {threats.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Active</div>
          </div>
          <div className="text-center p-4 cyber-card">
            <div className="text-3xl font-mono text-green-400 mb-1">
              {threats.filter(t => t.votes && (t.votes.credible || 0) > (t.votes.not_credible || 0)).length}
            </div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="text-center p-4 cyber-card">
            <div className="text-2xl font-mono text-cyan-400 mb-1">
              <Activity className="w-6 h-6 inline animate-pulse" />
            </div>
            <div className="text-xs text-muted-foreground">System Online</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <Input
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
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
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? "default" : "outline"}
              size="sm"
              className="cyber-button"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? "default" : "outline"}
              size="sm"
              className="cyber-button"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Critical Alerts */}
      <AnimatePresence>
        {criticalThreats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="cyber-card p-6 border-2 border-red-500/50 bg-red-500/5"
          >
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-threat-pulse" />
              <h3 className="text-xl font-semibold text-red-400">
                {criticalThreats.length} Critical Threat{criticalThreats.length !== 1 ? 's' : ''} Detected
              </h3>
              <Badge className="bg-red-500/20 text-red-400 border-red-500 animate-pulse">
                PRIORITY
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Immediate analysis and response protocols recommended for severity ≥ 80 threats
            </p>
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {criticalThreats.slice(0, 6).map(threat => (
                <EnhancedThreatCard 
                  key={threat.id} 
                  threat={threat}
                  onSimulate={handleSimulate}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Tabs defaultValue="threats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 cyber-tabs">
          <TabsTrigger value="threats" className="cyber-tab">
            <Globe className="w-4 h-4 mr-2" />
            Active Threats ({filteredThreats.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="cyber-tab">
            <Activity className="w-4 h-4 mr-2" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="simulation" className="cyber-tab">
            <Brain className="w-4 h-4 mr-2" />
            Simulation Lab
          </TabsTrigger>
        </TabsList>

        {/* Threats Grid/List */}
        <TabsContent value="threats" className="space-y-6">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
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
                    onSimulate={handleSimulate}
                    onAnalyze={handleAnalyze}
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
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics">
          <RealTimeAnalytics />
        </TabsContent>

        {/* Simulation Lab */}
        <TabsContent value="simulation">
          <SimulationLab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
