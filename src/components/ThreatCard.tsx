import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Vote } from 'lucide-react';
import { useVoteThreat, useVerifyThreat } from '@/hooks/useThreats';

interface ThreatCardProps {
  threat: {
    id: string;
    title: string;
    type: string;
    severity: number;
    summary: string;
    regions: string[];
    sources: string[];
    timestamp: string;
    status: string;
    votes: { confirm: number; deny: number; skeptical: number };
  };
}

const ThreatCard: React.FC<ThreatCardProps> = ({ threat }) => {
  const voteMutation = useVoteThreat();
  const verifyMutation = useVerifyThreat();

  const handleVote = (voteType: 'credible' | 'not_credible') => {
    voteMutation.mutate({
      threatId: threat.id,
      vote: voteType
    });
  };

  const handleVerify = () => {
    verifyMutation.mutate({
      threatId: threat.id,
      sources: ['verified-source.com'],
      credibilityScore: 85
    });
  };

  return (
    <Card className="w-[380px] shadow-md">
      <CardHeader>
        <CardTitle>{threat.title}</CardTitle>
        <CardDescription>{threat.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex items-center">
            <Badge variant="secondary">{threat.type}</Badge>
            <Badge className="ml-2">Severity: {threat.severity}</Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            Regions: {threat.regions.join(', ')}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            Sources: {threat.sources.join(', ')}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleVote('credible')}>
            <Vote className="mr-2 h-4 w-4" />
            Credible
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleVote('not_credible')}>
            <Vote className="mr-2 h-4 w-4" />
            Not Credible
          </Button>
        </div>
        <Button size="sm" onClick={handleVerify}>Verify</Button>
      </CardFooter>
    </Card>
  );
};

export default ThreatCard;
