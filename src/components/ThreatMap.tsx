
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle } from 'lucide-react';

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

interface ThreatMapProps {
  threats: Threat[];
}

export const ThreatMap = ({ threats }: ThreatMapProps) => {
  const regions = Array.from(new Set(threats.map(t => t.region)));
  
  const getRegionThreats = (region: string) => {
    return threats.filter(t => t.region === region);
  };

  const getRegionSeverity = (region: string) => {
    const regionThreats = getRegionThreats(region);
    if (regionThreats.length === 0) return 0;
    return Math.max(...regionThreats.map(t => t.severity));
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400 bg-red-500/20';
    if (severity >= 60) return 'text-orange-400 bg-orange-500/20';
    if (severity >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-cyan-400 neon-text flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Global Threat Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simplified world map representation */}
        <div className="relative bg-slate-900/50 rounded-lg p-4 border border-cyan-500/30">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Global Threat Distribution
          </div>
          
          {regions.map((region, index) => {
            const severity = getRegionSeverity(region);
            const threatCount = getRegionThreats(region).length;
            
            return (
              <div 
                key={region}
                className={`
                  mb-3 p-3 rounded-lg border border-cyan-500/20
                  ${getSeverityColor(severity)}
                  hover:scale-105 transition-transform cursor-pointer
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{region}</div>
                    <div className="text-xs opacity-70">
                      {threatCount} threat{threatCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-mono">{severity}</div>
                    <div className="text-xs">Max Severity</div>
                  </div>
                </div>
                
                {severity >= 80 && (
                  <div className="mt-2 flex items-center text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1 animate-pulse" />
                    Critical Alert
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
