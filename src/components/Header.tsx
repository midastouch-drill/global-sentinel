
import { Shield, Globe, Brain, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chaosIndex: number;
}

export const Header = ({ activeTab, setActiveTab, chaosIndex }: HeaderProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Threat Dashboard', icon: Shield },
    { id: 'simulator', label: 'Crisis Simulator', icon: Brain },
    { id: 'map', label: 'Global Map', icon: Globe },
    { id: 'validator', label: 'Citizen Validator', icon: Users },
  ];

  const getChaosLevel = (index: number) => {
    if (index < 30) return { level: 'LOW', color: 'bg-green-500' };
    if (index < 60) return { level: 'MODERATE', color: 'bg-yellow-500' };
    if (index < 80) return { level: 'HIGH', color: 'bg-orange-500' };
    return { level: 'CRITICAL', color: 'bg-red-500' };
  };

  const chaosLevel = getChaosLevel(chaosIndex);

  return (
    <header className="border-b border-cyan-500/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold neon-text text-cyan-400">
                  GLOBAL SENTINEL
                </h1>
                <p className="text-sm text-muted-foreground">
                  Earth's AI Immune System
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Global Chaos Index</div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`${chaosLevel.color} text-white border-0`}>
                  {chaosLevel.level}
                </Badge>
                <span className="text-2xl font-mono text-cyan-400">
                  {chaosIndex.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" title="System Online" />
          </div>
        </div>

        <nav className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`cyber-button ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' 
                    : 'hover:bg-cyan-500/10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
