
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoteResult {
  threatId: string;
  vote: string;
  userId: string;
  credibilityImpact: number;
  userPoints: number;
  newUserRank: string;
  communityStats: {
    totalVotes: number;
    consensus: number;
  };
}

interface VoteResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VoteResult | null;
}

export const VoteResultModal: React.FC<VoteResultModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md cyber-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Vote Recorded!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Points Earned */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center"
          >
            <div className="text-6xl font-bold text-green-400 mb-2">
              +{result.userPoints}
            </div>
            <div className="text-muted-foreground">Points Earned</div>
          </motion.div>

          {/* User Rank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="cyber-card border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-yellow-400">
                  {result.newUserRank}
                </div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <Card className="cyber-card">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-mono text-blue-400">
                  {result.communityStats.totalVotes}
                </div>
                <div className="text-xs text-muted-foreground">Total Votes</div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-mono text-green-400">
                  {result.communityStats.consensus}%
                </div>
                <div className="text-xs text-muted-foreground">Consensus</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vote Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Badge 
              className={`text-lg px-4 py-2 ${
                result.credibilityImpact > 0 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              Credibility {result.credibilityImpact > 0 ? '+' : ''}{result.credibilityImpact}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">
              Your vote: <span className="text-cyan-400 capitalize">{result.vote}</span>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
