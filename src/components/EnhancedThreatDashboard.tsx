
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Brain,
  Zap,
  Globe,
  Activity,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useThreats } from '@/hooks/useThreats';
import { useToast } from '@/hooks/use-toast';
import EnhancedThreatCard from './EnhancedThreatCard';
import { OpenStreetMap } from './OpenStreetMap';
import { ThreatChart } from './ThreatChart';
import { SimulationModal } from './SimulationModal';

export const EnhancedThreatDashboard = () => {
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'map' | 'chart'>('grid');
  const { toast } = useToast();

  const { 
    data: threatsResponse, 
    isLoading, 
    error,
    refetch
  } = useThreats();

  const threats = threatsResponse?.threats || [];
  const isConnected = threatsResponse?.success && !error;

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "🔄 Data Refreshed",
        description: `Updated ${threats.length} threats from intelligence network`,
      });
    } catch (error) {
      toast({
        title: "⚠️ Refresh Attempted", 
        description: "Using cached threat data",
      });
    }
  };

  const handleSimulate = (threat: any) => {
    setSelectedThreat(threat);
    setShowSimulation(true);
  };

  const criticalThreats = threats.filter((t: any) => t.severity >= 80);
  const highThreats = threats.filter((t: any) => t.severity >= 60 && t.severity < 80);
  const avgSeverity = threats.length > 0 
    ? Math.round(threats.reduce((sum: number, t: any) => sum + t.severity, 0) / threats.length)
    : 0;

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="animate-spin w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">
          Connecting to Global Intelligence Network
        </h3>
        <p className="text-sm text-muted-foreground">
          Accessing real-time threat database...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 neon-text mb-2">
              Enhanced Threat Intelligence Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Real-time Intelligence Connected' : 'Fallback Mode Active'}
                </span>
              </div>
              <Badge variant="outline" className="cyber-badge">
                <Activity className="w-3 h-3 mr-1" />
                v2.0 Enhanced
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="cyber-button"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Intel
            </Button>
            
            <Button 
              onClick={() => setShowSimulation(true)}
              className="cyber-button bg-purple-600/20 text-purple-400 border-purple-500 hover:bg-purple-600/30"
            >
              <Brain className="w-4 h-4 mr-2" />
              Crisis Simulator
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/20">
            <div className="text-3xl font-mono text-red-400 mb-1">{criticalThreats.length}</div>
            <div className="text-sm text-muted-foreground">Critical Threats</div>
            <Progress value={(criticalThreats.length / Math.max(threats.length, 1)) * 100} className="h-1 mt-2" />
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/20">
            <div className="text-3xl font-mono text-orange-400 mb-1">{highThreats.length}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
            <Progress value={(highThreats.length / Math.max(threats.length, 1)) * 100} className="h-1 mt-2" />
          </div>
          <div className="text-3xl font-mono text-cyan-400 mb-1">{threats.length}</div>
            <div className="text-sm text-muted-foreground">Total Active</div>
            <Progress value={100} className="h-1 mt-2" />
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/20">
            <div className="text-3xl font-mono text-yellow-400 mb-1">{avgSeverity}%</div>
            <div className="text-sm text-muted-foreground">Avg Severity</div>
            <Progress value={avgSeverity} className="h-1 mt-2" />
          </div>
        </div>
      </motion.div>

      {/* View Selector */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center space-x-2"
      >
        <Button
          variant={activeView === 'grid' ? 'default' : 'outline'}
          onClick={() => setActiveView('grid')}
          className="cyber-button"
        >
          <Shield className="w-4 h-4 mr-2" />
          Threat Grid
        </Button>
        <Button
          variant={activeView === 'map' ? 'default' : 'outline'}
          onClick={() => setActiveView('map')}
          className="cyber-button"
        >
          <Globe className="w-4 h-4 mr-2" />
          Global Map
        </Button>
        <Button
          variant={activeView === 'chart' ? 'default' : 'outline'}
          onClick={() => setActiveView('chart')}
          className="cyber-button"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </motion.div>

      {/* Critical Alerts Banner */}
      {criticalThreats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-4 border-2 border-red-500/50 bg-red-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">
                  ⚠️ {criticalThreats.length} Critical Threat{criticalThreats.length !== 1 ? 's' : ''} Detected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Immediate attention required - severity level 80+
                </p>
              </div>
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
              HIGH PRIORITY
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'grid' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {threats.map((threat: any) => (
              <EnhancedThreatCard 
                key={threat.id} 
                threat={threat}
                onSimulate={handleSimulate}
              />
            ))}
            {threats.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Active Threats
                </h3>
                <p className="text-sm text-muted-foreground">
                  The intelligence network is currently scanning for threats...
                </p>
              </div>
            )}
          </div>
        )}

        {activeView === 'map' && (
          <OpenStreetMap threats={threats} />
        )}

        {activeView === 'chart' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <ThreatChart threats={threats} />
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Intelligence Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Most Common Type</div>
                    <div className="font-mono text-cyan-400">
                      {threats.length > 0 ? 'Cyber Security' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Response Time</div>
                    <div className="font-mono text-green-400">2.3min</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Detection Rate</div>
                    <div className="font-mono text-cyan-400">98.7%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">False Positives</div>
                    <div className="font-mono text-yellow-400">1.2%</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">System Health</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Optimal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        threat={selectedThreat}
      />
    </div>
  );
};
