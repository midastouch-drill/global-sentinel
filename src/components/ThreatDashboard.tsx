
import { useState } from 'react';
import ThreatCard from './ThreatCard';
import { ThreatChart } from './ThreatChart';
import { ThreatFeed } from './ThreatFeed';
import SimulationModal from './SimulationModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Brain, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useThreats } from '../hooks/useThreats';
import { motion } from 'framer-motion';

export const ThreatDashboard = () => {
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const { toast } = useToast();

  const { 
    data: threatsResponse, 
    isLoading, 
    refetch,
    error 
  } = useThreats();

  const threats = threatsResponse?.threats || [];
  const isConnected = threatsResponse?.success && !error;

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "🔍 Threat Database Updated",
        description: `Refreshed ${threats.length} active threats from global sources`,
      });
    } catch (error) {
      toast({
        title: "🔄 Update Attempted",
        description: "Refreshing threat intelligence database",
      });
    }
  };

  const handleSimulate = (threat) => {
    setSelectedThreat(threat);
    setShowSimulation(true);
  };

  const criticalThreats = threats.filter(t => t.severity >= 80);

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
          Accessing threat intelligence database...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text">
              Global Threat Detection System
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">
                Real-time AI-powered threat analysis with live backend integration
              </p>
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">CONNECTED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">FALLBACK MODE</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="cyber-button"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating...' : 'Refresh'}
            </Button>
            
            <Button 
              onClick={() => setShowSimulation(true)}
              className="cyber-button"
            >
              <Brain className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-mono text-red-400">
              {criticalThreats.length}
            </div>
            <div className="text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-orange-400">
              {threats.filter(t => t.severity >= 60 && t.severity < 80).length}
            </div>
            <div className="text-muted-foreground">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-cyan-400">
              {threats.length}
            </div>
            <div className="text-muted-foreground">Total Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-green-400">
              <Zap className="w-5 h-5 inline animate-pulse" />
            </div>
            <div className="text-muted-foreground">System Status</div>
          </div>
        </div>
      </motion.div>

      {/* Critical Alerts */}
      {criticalThreats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="threat-card p-4 border-2 border-red-500/50"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-threat-pulse" />
            <h3 className="text-lg font-semibold text-red-400">
              {criticalThreats.length} Critical Threat{criticalThreats.length !== 1 ? 's' : ''} Detected
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {criticalThreats.map(threat => (
              <ThreatCard 
                key={threat.id} 
                threat={threat} 
                priority="critical"
                onSimulate={() => handleSimulate(threat)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ThreatFeed 
            threats={threats}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="space-y-6">
          <ThreatChart threats={threats} />
        </div>
      </div>

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        threat={selectedThreat}
      />
    </div>
  );
};
