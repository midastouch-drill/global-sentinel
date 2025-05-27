
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Clock, 
  Globe,
  Zap,
  Brain,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoteThreat } from '@/hooks/useThreats';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface EnhancedThreatCardProps {
  threat: {
    id: string;
    title: string;
    type: string;
    severity: number;
    summary: string;
    regions?: string[];
    sources?: string[];
    timestamp: string;
    status?: string;
    confidence?: number;
    votes?: { credible: number; not_credible: number };
  };
  onSimulate?: (threat: any) => void;
  onAnalyze?: (threat: any) => void;
}

const EnhancedThreatCard: React.FC<EnhancedThreatCardProps> = ({ 
  threat, 
  onSimulate, 
  onAnalyze 
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const voteMutation = useVoteThreat();
  const { toast } = useToast();

  const handleVote = async (voteType: 'credible' | 'not_credible') => {
    setIsVoting(true);
    setAnimatingButton(voteType);
    
    try {
      await voteMutation.mutateAsync({
        threatId: threat.id,
        vote: voteType
      });
      
      toast({
        title: "✅ Vote Recorded",
        description: `Marked threat as ${voteType === 'credible' ? 'credible' : 'not credible'}`,
      });
    } catch (error) {
      toast({
        title: "❌ Vote Failed",
        description: "Unable to record vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
      setAnimatingButton(null);
    }
  };

  const handleVerify = async () => {
    try {
      // Mock verification for now
      toast({
        title: "🔍 Verification Initiated",
        description: "Threat verification process started",
      });
    } catch (error) {
      toast({
        title: "❌ Verification Failed",
        description: "Unable to verify threat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400 border-red-500/50';
    if (severity >= 60) return 'text-orange-400 border-orange-500/50';
    if (severity >= 40) return 'text-yellow-400 border-yellow-500/50';
    return 'text-green-400 border-green-500/50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 80) return 'CRITICAL';
    if (severity >= 60) return 'HIGH';
    if (severity >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const confidence = threat.confidence || 70;
  const totalVotes = (threat.votes?.credible || 0) + (threat.votes?.not_credible || 0);
  const credibilityScore = totalVotes > 0 
    ? Math.round(((threat.votes?.credible || 0) / totalVotes) * 100)
    : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="w-full h-full"
    >
      <Card className={`cyber-card border-2 ${getSeverityColor(threat.severity)} bg-background/95 backdrop-blur-sm relative overflow-hidden h-full flex flex-col`}>
        {/* Severity indicator */}
        <div className={`absolute top-0 left-0 w-2 h-full ${threat.severity >= 80 ? 'bg-red-500' : threat.severity >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
        
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-cyan-400 mb-2 leading-tight line-clamp-2">
                {threat.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="cyber-badge">
                  {threat.type}
                </Badge>
                <Badge className={`${getSeverityColor(threat.severity)} bg-transparent border`}>
                  {getSeverityLabel(threat.severity)} {threat.severity}
                </Badge>
              </div>
            </div>
            
            {/* Confidence Ring */}
            <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
              <Progress 
                value={confidence} 
                className="absolute inset-0 w-16 h-16 rounded-full [&>div]:rounded-full"
              />
              <span className="text-xs font-mono text-cyan-400 z-10">
                {confidence}%
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-shrink-0">
            {threat.summary}
          </p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs flex-shrink-0">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="text-muted-foreground truncate">
                {threat.regions?.slice(0, 2).join(', ') || 'Global'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="text-muted-foreground">
                {format(new Date(threat.timestamp), 'HH:mm MMM dd')}
              </span>
            </div>
          </div>

          {/* Credibility Score */}
          {totalVotes > 0 && (
            <div className="space-y-2 flex-shrink-0">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Community Credibility</span>
                <span className="text-cyan-400">{credibilityScore}%</span>
              </div>
              <Progress value={credibilityScore} className="h-1" />
              <div className="text-xs text-muted-foreground">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {/* Voting Buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 cyber-button text-xs ${animatingButton === 'credible' ? 'animate-pulse' : ''}`}
                onClick={() => handleVote('credible')}
                disabled={isVoting}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Credible
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 cyber-button text-xs ${animatingButton === 'not_credible' ? 'animate-pulse' : ''}`}
                onClick={() => handleVote('not_credible')}
                disabled={isVoting}
              >
                <XCircle className="w-3 h-3 mr-1" />
                False
              </Button>
            </div>

            {/* Analysis Buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                className="flex-1 cyber-button bg-blue-600/20 text-blue-400 border-blue-500 hover:bg-blue-600/30 text-xs"
                onClick={() => onSimulate?.(threat)}
              >
                <Play className="w-3 h-3 mr-1" />
                Simulate
              </Button>
              <Button
                size="sm"
                className="flex-1 cyber-button bg-purple-600/20 text-purple-400 border-purple-500 hover:bg-purple-600/30 text-xs"
                onClick={() => onAnalyze?.(threat)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Analyze
              </Button>
            </div>
          </div>

          {/* Sources */}
          {threat.sources && threat.sources.length > 0 && (
            <div className="pt-2 border-t border-border/50 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span className="truncate">Sources: {threat.sources.slice(0, 2).join(', ')}</span>
                {threat.sources.length > 2 && (
                  <span>+{threat.sources.length - 2} more</span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Threat Level Glow Effect */}
        {threat.severity >= 80 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default EnhancedThreatCard;
