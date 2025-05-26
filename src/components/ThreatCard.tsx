
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useVoteThreat, useVerifyThreat } from '../hooks/useThreats';
import { TrendingUp, TrendingDown, ArrowRight, ExternalLink, Brain, Shield, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  region?: string;
  confidence?: number;
  sources?: string[];
  trend?: 'rising' | 'stable' | 'declining';
  timestamp: string;
  source: string;
  votes?: { confirm: number; deny: number; skeptical: number };
  credibilityScore?: number;
}

interface ThreatCardProps {
  threat: Threat;
  priority?: 'critical' | 'normal';
  onSimulate?: (threat: Threat) => void;
}

export const ThreatCard = ({ threat, priority = 'normal', onSimulate }: ThreatCardProps) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const voteMutation = useVoteThreat();
  const verifyMutation = useVerifyThreat();

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

  const handleVote = async (vote: 'confirm' | 'deny' | 'skeptical') => {
    if (userVote) return; // Prevent multiple votes
    
    try {
      await voteMutation.mutateAsync({
        threatId: threat.id,
        vote,
        userId: `user_${Date.now()}`, // In production, use actual user ID
      });
      setUserVote(vote);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({
        threatId: threat.id,
        claim: threat.title,
        description: threat.summary,
      });
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const totalVotes = (threat.votes?.confirm || 0) + (threat.votes?.deny || 0) + (threat.votes?.skeptical || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`
        ${priority === 'critical' ? 'threat-card' : 'cyber-card'} 
        relative overflow-hidden transition-all duration-300
        ${priority === 'critical' ? 'animate-threat-pulse' : ''}
      `}>
        <div className={`absolute inset-0 bg-gradient-to-br ${getSeverityBg(threat.severity)} opacity-30`} />
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                {threat.title}
              </CardTitle>
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {threat.type}
                </Badge>
                {threat.region && (
                  <Badge variant="outline" className="text-xs">
                    {threat.region}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {threat.source}
                </Badge>
              </div>
            </div>
            
            <div className="text-right ml-4">
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
              {threat.trend && TrendIcon && (
                <>
                  <TrendIcon className={`w-4 h-4 ${
                    threat.trend === 'rising' ? 'text-red-400' : 'text-green-400'
                  }`} />
                  <span className="capitalize">{threat.trend}</span>
                </>
              )}
            </div>
            
            <div className="text-right">
              {threat.confidence && (
                <div>Confidence: {threat.confidence}%</div>
              )}
              <div className="text-xs text-muted-foreground">
                {format(new Date(threat.timestamp), 'MMM dd, HH:mm')}
              </div>
            </div>
          </div>

          {/* Voting Section */}
          {threat.votes && (
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center justify-between">
                <span>Community Validation:</span>
                <span className="text-xs text-muted-foreground">
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={userVote === 'confirm' ? 'default' : 'outline'}
                  onClick={() => handleVote('confirm')}
                  disabled={!!userVote || voteMutation.isPending}
                  className="flex-1 text-xs"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {threat.votes.confirm}
                </Button>
                <Button
                  size="sm"
                  variant={userVote === 'skeptical' ? 'default' : 'outline'}
                  onClick={() => handleVote('skeptical')}
                  disabled={!!userVote || voteMutation.isPending}
                  className="flex-1 text-xs"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {threat.votes.skeptical}
                </Button>
                <Button
                  size="sm"
                  variant={userVote === 'deny' ? 'default' : 'outline'}
                  onClick={() => handleVote('deny')}
                  disabled={!!userVote || voteMutation.isPending}
                  className="flex-1 text-xs"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  {threat.votes.deny}
                </Button>
              </div>
            </div>
          )}

          {/* Sources */}
          {threat.sources && threat.sources.length > 0 && (
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
          )}

          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              className="cyber-button flex-1"
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
            >
              <Shield className="w-3 h-3 mr-1" />
              {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
            </Button>
            
            {onSimulate && (
              <Button 
                size="sm" 
                className="cyber-button flex-1"
                onClick={() => onSimulate(threat)}
              >
                <Brain className="w-3 h-3 mr-1" />
                Simulate
              </Button>
            )}
            
            <Button size="sm" variant="outline" className="cyber-button">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
