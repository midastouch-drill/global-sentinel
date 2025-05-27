
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Check, X, Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { threatsApi } from '../api/threats';
import { motion, AnimatePresence } from 'framer-motion';

interface VerificationResult {
  id: string;
  claim: string;
  verdict: string;
  confidence: number;
  supportingEvidence: string[];
  challengingEvidence: string[];
  sources: string[];
  reasoning: string;
  keyInsights: string[];
  evidenceQuality: string;
  sourceCredibility: string;
  timestamp: string;
}

export const LiveVerificationEngine = () => {
  const [claim, setClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runLiveVerification = async () => {
    if (!claim.trim()) {
      toast({
        title: "⚠️ Claim Required",
        description: "Please enter a claim to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    toast({
      title: "🔍 Live Verification",
      description: "Running dual-sided Sonar analysis...",
    });

    try {
      console.log('🚀 Starting live verification:', claim);
      
      const response = await threatsApi.verify({ claim });
      
      if (response.data.success) {
        setResult(response.data.verification);
        toast({
          title: "✅ Verification Complete",
          description: `Verdict: ${response.data.verification.verdict}`,
        });
        console.log('✅ Live verification completed:', response.data.verification);
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
      
    } catch (error: any) {
      console.error('🚨 Live verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Verification system failure';
      setError(errorMessage);
      
      toast({
        title: "❌ Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const retryVerification = () => {
    setError(null);
    setResult(null);
    runLiveVerification();
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('Highly Credible')) return 'text-green-400';
    if (verdict.includes('Likely True')) return 'text-blue-400';
    if (verdict.includes('Partially Verified')) return 'text-yellow-400';
    if (verdict.includes('Mixed Evidence')) return 'text-orange-400';
    if (verdict.includes('Questionable')) return 'text-red-400';
    return 'text-gray-400';
  };

  const getQualityColor = (quality: string) => {
    if (quality === 'High') return 'text-green-400';
    if (quality === 'Medium') return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Live Verification Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Shield className="w-8 h-8 mr-3 animate-pulse" />
              Live Verification Engine
            </h2>
            <p className="text-muted-foreground">
              Dual-sided AI fact-checking with Sonar reasoning + evidence search
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-cyan-400">
              Claim to Verify
            </label>
            <Textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g., China has deployed military assets near Taiwan in the past 48 hours..."
              className="mt-2 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500 text-foreground min-h-[100px]"
            />
          </div>

          <Button 
            onClick={runLiveVerification}
            disabled={isVerifying || !claim.trim()}
            className="cyber-button w-full"
          >
            {isVerifying ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-spin" />
                Running Live Verification...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify with AI
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="cyber-card border-red-500/50"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-red-400 font-medium">Verification Failed</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button 
                    onClick={retryVerification}
                    variant="outline"
                    className="mt-3 cyber-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Verification
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Verification Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verification Verdict */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verification Verdict
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                  <p className="text-foreground">{result.claim}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-xl font-mono ${getVerdictColor(result.verdict)}`}>
                      {result.verdict}
                    </div>
                    <div className="text-sm text-muted-foreground">AI Verdict</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-mono text-cyan-400">
                      {result.confidence}%
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                    <Progress value={result.confidence} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-mono ${getQualityColor(result.evidenceQuality)}`}>
                      {result.evidenceQuality} Quality
                    </div>
                    <div className="text-sm text-muted-foreground">Evidence</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dual-Sided Evidence Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Supporting Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.supportingEvidence.map((evidence, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <p className="text-sm text-green-300">{evidence}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center">
                    <X className="w-5 h-5 mr-2" />
                    Challenging Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.challengingEvidence.map((evidence, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                      >
                        <p className="text-sm text-red-300">{evidence}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            {result.keyInsights && result.keyInsights.length > 0 && (
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-purple-400">
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keyInsights.map((insight, index) => (
                      <div key={index} className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <p className="text-sm text-purple-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources and Quality Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Evidence Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge 
                          variant="outline"
                          className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs"
                        >
                          {source}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-yellow-400">
                    Quality Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Evidence Quality:</span>
                      <Badge className={`${getQualityColor(result.evidenceQuality)} bg-transparent border`}>
                        {result.evidenceQuality}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Source Credibility:</span>
                      <Badge className={`${getQualityColor(result.sourceCredibility)} bg-transparent border`}>
                        {result.sourceCredibility}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
