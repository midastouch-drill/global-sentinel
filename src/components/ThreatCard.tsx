
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, ArrowRight, ExternalLink } from 'lucide-react';

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

interface ThreatCardProps {
  threat: Threat;
  priority?: 'critical' | 'normal';
}

export const ThreatCard = ({ threat, priority = 'normal' }: ThreatCardProps) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400';
    if (severity >= 60) return 'text-orange-400';
    if (severity >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSeverityBg = (severity: number) => {
    if (severity >= 80) return 'from-red-500/20 to-red-900/20';
    if (severity >= 60) return 'from-orange-500/20 to-orange-900/20';
    if (severity >= 40) return 'from-yellow-500/20 to-yellow-900/20';
    return 'from-green-500/20 to-green-900/20';
  };

  const TrendIcon = threat.trend === 'rising' ? TrendingUp : TrendingDown;

  return (
    <Card className={`
      ${priority === 'critical' ? 'threat-card' : 'cyber-card'} 
      relative overflow-hidden transition-all duration-300 hover:scale-[1.02]
      ${priority === 'critical' ? 'animate-threat-pulse' : ''}
    `}>
      <div className={`absolute inset-0 bg-gradient-to-br ${getSeverityBg(threat.severity)} opacity-30`} />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              {threat.title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {threat.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {threat.region}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-mono font-bold ${getSeverityColor(threat.severity)}`}>
              {threat.severity}
            </div>
            <div className="text-xs text-muted-foreground">Severity</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Threat Level</span>
            <span className={getSeverityColor(threat.severity)}>
              {threat.severity >= 80 ? 'CRITICAL' : 
               threat.severity >= 60 ? 'HIGH' : 
               threat.severity >= 40 ? 'MODERATE' : 'LOW'}
            </span>
          </div>
          <Progress value={threat.severity} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {threat.summary}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <TrendIcon className={`w-4 h-4 ${
              threat.trend === 'rising' ? 'text-red-400' : 'text-green-400'
            }`} />
            <span className="capitalize">{threat.trend}</span>
          </div>
          
          <div className="text-right">
            <div>Confidence: {threat.confidence}%</div>
            <div className="text-xs text-muted-foreground">
              Updated {threat.lastUpdated}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Sources:</div>
          <div className="flex flex-wrap gap-1">
            {threat.sources.map((source, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              >
                {source}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button size="sm" className="cyber-button flex-1">
            <ArrowRight className="w-3 h-3 mr-1" />
            Analyze
          </Button>
          <Button size="sm" variant="outline" className="cyber-button">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
