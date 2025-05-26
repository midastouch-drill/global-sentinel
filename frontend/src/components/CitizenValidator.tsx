
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, ThumbsUp, ThumbsDown, Star, Award, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValidationItem {
  id: string;
  title: string;
  description: string;
  severity: number;
  type: string;
  votes: {
    credible: number;
    needsReview: number;
  };
  userVote?: 'credible' | 'needs_review' | null;
  points: number;
}

export const CitizenValidator = () => {
  const [userPoints, setUserPoints] = useState(247);
  const [userLevel, setUserLevel] = useState(3);
  const { toast } = useToast();

  const [validationItems, setValidationItems] = useState<ValidationItem[]>([
    {
      id: '1',
      title: 'Arctic Methane Release Data Anomaly',
      description: 'Satellite data showing unusual methane emission patterns in Siberian permafrost regions. Requires validation of measurement accuracy.',
      severity: 91,
      type: 'Environmental',
      votes: { credible: 23, needsReview: 7 },
      points: 15
    },
    {
      id: '2',
      title: 'Social Media Sentiment Shift - Southern Europe',
      description: 'AI detected significant shift in public sentiment regarding water security. Cross-reference with ground truth data needed.',
      severity: 67,
      type: 'Social/Political',
      votes: { credible: 15, needsReview: 12 },
      points: 10
    },
    {
      id: '3',
      title: 'Supply Chain Disruption Pattern',
      description: 'Unusual patterns detected in global shipping routes and commodity prices. Potential indicator of emerging crisis.',
      severity: 54,
      type: 'Economic',
      votes: { credible: 8, needsReview: 18 },
      points: 12
    }
  ]);

  const handleVote = (itemId: string, vote: 'credible' | 'needs_review') => {
    setValidationItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newVotes = { ...item.votes };
        
        // Remove previous vote if exists
        if (item.userVote === 'credible') newVotes.credible--;
        if (item.userVote === 'needs_review') newVotes.needsReview--;
        
        // Add new vote
        if (vote === 'credible') newVotes.credible++;
        else newVotes.needsReview++;
        
        return {
          ...item,
          votes: newVotes,
          userVote: vote
        };
      }
      return item;
    }));

    // Award points
    const pointsEarned = Math.floor(Math.random() * 5) + 3;
    setUserPoints(prev => prev + pointsEarned);

    toast({
      title: "🎉 Vote Recorded!",
      description: `+${pointsEarned} points earned for validation`,
    });
  };

  const getCredibilityScore = (item: ValidationItem) => {
    const total = item.votes.credible + item.votes.needsReview;
    if (total === 0) return 50;
    return Math.round((item.votes.credible / total) * 100);
  };

  const getUserRank = (level: number) => {
    const ranks = ['Novice', 'Analyst', 'Specialist', 'Expert', 'Master Validator'];
    return ranks[Math.min(level - 1, ranks.length - 1)];
  };

  return (
    <div className="space-y-6">
      {/* User Dashboard */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Users className="w-8 h-8 mr-3 animate-pulse-glow" />
              Citizen Validation Network
            </h2>
            <p className="text-muted-foreground">
              Help verify global threats and earn reputation points
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cyan-400">{userPoints}</div>
              <div className="text-sm text-muted-foreground">Validation Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-400">Level {userLevel}</div>
              <div className="text-sm text-muted-foreground">{getUserRank(userLevel)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4 text-center">
              <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">89%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Queue */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Validation Queue
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and validate AI-detected threats to help improve global security
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {validationItems.map((item) => {
            const credibilityScore = getCredibilityScore(item);
            const totalVotes = item.votes.credible + item.votes.needsReview;
            
            return (
              <Card key={item.id} className="bg-slate-900/30 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.type}</Badge>
                          <Badge variant="outline" className="text-orange-400">
                            Severity: {item.severity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-mono text-cyan-400">
                          +{item.points} pts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Reward
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>

                    {/* Current Validation Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Community Credibility Score</span>
                        <span className={`font-mono ${
                          credibilityScore >= 70 ? 'text-green-400' :
                          credibilityScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {credibilityScore}%
                        </span>
                      </div>
                      <Progress value={credibilityScore} className="h-2" />
                    </div>

                    {/* Vote Breakdown */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                        <span>Credible: {item.votes.credible}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                        <span>Needs Review: {item.votes.needsReview}</span>
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        onClick={() => handleVote(item.id, 'credible')}
                        disabled={item.userVote !== null}
                        className={`cyber-button flex-1 ${
                          item.userVote === 'credible' 
                            ? 'bg-green-500/20 border-green-500 text-green-400' 
                            : ''
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        {item.userVote === 'credible' ? 'Voted Credible' : 'Mark Credible'}
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(item.id, 'needs_review')}
                        disabled={item.userVote !== null}
                        className={`cyber-button flex-1 ${
                          item.userVote === 'needs_review' 
                            ? 'bg-red-500/20 border-red-500 text-red-400' 
                            : ''
                        }`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {item.userVote === 'needs_review' ? 'Voted Needs Review' : 'Needs Review'}
                      </Button>
                    </div>

                    {item.userVote && (
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-sm">
                        <div className="flex items-center text-cyan-400">
                          <Check className="w-4 h-4 mr-2" />
                          Thank you for your validation! Your vote has been recorded.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Top Validators This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'DataAnalyst_42', points: 1247, level: 5, accuracy: 94 },
              { name: 'GlobalWatcher', points: 1156, level: 4, accuracy: 92 },
              { name: 'ThreatHunter', points: 987, level: 4, accuracy: 89 },
              { name: 'You', points: userPoints, level: userLevel, accuracy: 89 },
              { name: 'SecurityExpert', points: 823, level: 3, accuracy: 87 }
            ].map((user, index) => (
              <div 
                key={user.name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === 'You' 
                    ? 'bg-cyan-500/10 border border-cyan-500/30' 
                    : 'bg-slate-900/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-500/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-medium ${
                      user.name === 'You' ? 'text-cyan-400' : 'text-foreground'
                    }`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Level {user.level} • {user.accuracy}% accuracy
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-cyan-400">{user.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
