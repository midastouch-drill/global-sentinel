
import { useState, useEffect } from 'react';
import { ThreatCard } from './ThreatCard';
import { ThreatMap } from './ThreatMap';
import { ThreatChart } from './ThreatChart';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  region: string;
  confidence: number;
  sources: string[];
  trend: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

export const ThreatDashboard = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const { toast } = useToast();

  const mockThreats: Threat[] = [
    {
      id: '1',
      title: 'Southern Europe Drought Crisis Escalation',
      severity: 87,
      type: 'Climate/Political',
      summary: 'AI analysis indicates severe drought conditions in Southern Europe showing correlation with political instability markers. Resource scarcity patterns match historical conflict precursors.',
      region: 'Southern Europe',
      confidence: 78,
      sources: ['NASA Fire Map', 'EU Agricultural Reports', 'IMF Economic Data'],
      trend: 'rising',
      lastUpdated: '2 minutes ago'
    },
    {
      id: '2',
      title: 'Central Asia Pandemic Risk Emergence',
      severity: 72,
      type: 'Health/Security',
      summary: 'Anomalous patterns detected in health surveillance data from Central Asian regions. Cross-border movement analysis suggests potential for rapid transmission.',
      region: 'Central Asia',
      confidence: 65,
      sources: ['WHO Surveillance', 'bioRxiv.org', 'Border Control Data'],
      trend: 'rising',
      lastUpdated: '15 minutes ago'
    },
    {
      id: '3',
      title: 'Cyber Infrastructure Vulnerability Window',
      severity: 69,
      type: 'Cyber/Critical Infrastructure',
      summary: 'Multiple critical infrastructure networks showing synchronized vulnerability patterns. Potential coordinated attack vector identified.',
      region: 'Global',
      confidence: 82,
      sources: ['CERT Advisories', 'Dark Web Intelligence', 'Infrastructure Monitoring'],
      trend: 'stable',
      lastUpdated: '32 minutes ago'
    },
    {
      id: '4',
      title: 'Arctic Methane Release Acceleration',
      severity: 91,
      type: 'Environmental/Climate',
      summary: 'Satellite data indicates rapid acceleration of methane release from Arctic permafrost. Feedback loop threshold potentially approaching.',
      region: 'Arctic Circle',
      confidence: 89,
      sources: ['NASA MODIS', 'NOAA Climate Data', 'Arctic Research Stations'],
      trend: 'rising',
      lastUpdated: '1 hour ago'
    }
  ];

  const simulateDetection = async () => {
    setLoading(true);
    
    toast({
      title: "🔍 Threat Detection Initiated",
      description: "Scanning global data streams with Perplexity Sonar...",
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setThreats(mockThreats);
    setLastScan(new Date());
    setLoading(false);

    toast({
      title: "✅ Threat Analysis Complete",
      description: `Detected ${mockThreats.length} potential global threats`,
    });
  };

  useEffect(() => {
    simulateDetection();
  }, []);

  const criticalThreats = threats.filter(t => t.severity >= 80);
  const moderateThreats = threats.filter(t => t.severity >= 60 && t.severity < 80);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text">
              Global Threat Detection
            </h2>
            <p className="text-muted-foreground">
              Real-time AI-powered threat analysis using Perplexity Sonar
            </p>
          </div>
          
          <Button 
            onClick={simulateDetection}
            disabled={loading}
            className="cyber-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Detect Threats'}
          </Button>
        </div>

        {lastScan && (
          <p className="text-sm text-muted-foreground">
            Last scan: {lastScan.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Critical Alerts */}
      {criticalThreats.length > 0 && (
        <div className="threat-card p-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 threat-indicator" />
            <h3 className="text-lg font-semibold text-red-400">
              Critical Threats Detected
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {criticalThreats.map(threat => (
              <ThreatCard key={threat.id} threat={threat} priority="critical" />
            ))}
          </div>
        </div>
      )}

      {/* Threat Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-card p-6">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">
              Active Threats
            </h3>
            <div className="space-y-4">
              {threats.map(threat => (
                <ThreatCard key={threat.id} threat={threat} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ThreatChart threats={threats} />
          <ThreatMap threats={threats} />
        </div>
      </div>
    </div>
  );
};
