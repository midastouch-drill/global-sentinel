
import { Shield, Globe, Brain, Users, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chaosIndex: number;
  threatCount?: number;
}

export const Header = ({ activeTab, setActiveTab, chaosIndex, threatCount = 0 }: HeaderProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Threat Dashboard', icon: Shield },
    { id: 'map', label: 'Global Map', icon: Globe },
    { id: 'trends', label: 'Analytics', icon: TrendingUp },
    { id: 'simulator', label: 'Crisis Simulator', icon: Brain },
    { id: 'validator', label: 'Citizen Validator', icon: Users },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
  ];

  const getChaosLevel = (index: number) => {
    if (index < 30) return { level: 'LOW', color: 'bg-green-500' };
    if (index < 60) return { level: 'MODERATE', color: 'bg-yellow-500' };
    if (index < 80) return { level: 'HIGH', color: 'bg-orange-500' };
    return { level: 'CRITICAL', color: 'bg-red-500' };
  };

  const chaosLevel = getChaosLevel(chaosIndex);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-cyan-500/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold neon-text text-cyan-400">
                  GLOBAL SENTINEL
                </h1>
                <p className="text-sm text-muted-foreground">
                  Earth's AI Immune System v2.0
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-6">
            {/* Active Threats Counter */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Active Threats</div>
              <div className="text-2xl font-mono text-cyan-400">
                {threatCount}
              </div>
            </div>

            {/* Chaos Index */}
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Global Chaos Index</div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline" 
                  className={`${chaosLevel.color} text-white border-0 animate-pulse`}
                >
                  {chaosLevel.level}
                </Badge>
                <span className="text-2xl font-mono text-cyan-400">
                  {chaosIndex.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" title="System Online" />
              <div className="text-xs text-green-400 font-mono">LIVE</div>
            </div>
          </div>
        </div>

        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.div
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cyber-button whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-lg' 
                      : 'hover:bg-cyan-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.id === 'admin' && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/20 text-yellow-400">
                      DEV
                    </Badge>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
};
