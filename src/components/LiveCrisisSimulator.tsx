
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Zap, Target, ArrowRight, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { threatsApi } from '../api/threats';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSimulationResult {
  id: string;
  scenario: string;
  flowchart: string[];
  mitigations: string[];
  confidence: number;
  verdict: string;
  timeline: string;
  impact: string;
  sources: string[];
  supportingPoints: string[];
  counterPoints: string[];
  timestamp: string;
}

export const LiveCrisisSimulator = () => {
  const [scenario, setScenario] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<LiveSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runLiveSimulation = async () => {
    if (!scenario.trim()) {
      toast({
        title: "⚠️ Scenario Required",
        description: "Please enter a crisis scenario to simulate",
        variant: "destructive"
      });
      return;
    }

    setIsSimulating(true);
    setError(null);
    
    toast({
      title: "🧠 Live AI Simulation",
      description: "Running Sonar reasoning and deep search...",
    });

    try {
      console.log('🚀 Starting live simulation:', scenario);
      
      const response = await threatsApi.simulate({ scenario });
      
      if (response.data.success) {
        setResult(response.data.simulation);
        toast({
          title: "✅ Live Simulation Complete",
          description: `Verdict: ${response.data.simulation.verdict}`,
        });
        console.log('✅ Live simulation completed:', response.data.simulation);
      } else {
        throw new Error(response.data.error || 'Simulation failed');
      }
      
    } catch (error: any) {
      console.error('🚨 Live simulation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Simulation system failure';
      setError(errorMessage);
      
      toast({
        title: "❌ Simulation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const retrySimulation = () => {
    setError(null);
    setResult(null);
    runLiveSimulation();
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('Highly')) return 'text-red-400';
    if (verdict.includes('Likely')) return 'text-orange-400';
    if (verdict.includes('Possible')) return 'text-yellow-400';
    if (verdict.includes('Uncertain')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes('Highly') || verdict.includes('Likely')) return '🚨';
    if (verdict.includes('Possible')) return '⚠️';
    if (verdict.includes('Uncertain')) return '❓';
    return '🔍';
  };

  return (
    <div className="space-y-6">
      {/* Live Simulator Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Brain className="w-8 h-8 mr-3 animate-pulse" />
              Live Crisis Simulation Engine
            </h2>
            <p className="text-muted-foreground">
              Real-time AI analysis using Perplexity Sonar reasoning + deep search
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
              Crisis Hypothesis
            </label>
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Mass deepfake campaign targeting NATO exercises triggers Article 5 consideration..."
              className="mt-2 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500 text-foreground min-h-[120px]"
            />
          </div>

          <Button 
            onClick={runLiveSimulation}
            disabled={isSimulating || !scenario.trim()}
            className="cyber-button w-full"
          >
            {isSimulating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Running Live Simulation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Live Simulation
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
                  <h3 className="text-red-400 font-medium">Simulation Failed</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <Button 
                    onClick={retrySimulation}
                    variant="outline"
                    className="mt-3 cyber-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Simulation
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Simulation Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verdict Overview */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Live Analysis Verdict
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                  <p className="text-foreground">{result.scenario}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-mono ${getVerdictColor(result.verdict)}`}>
                      {getVerdictIcon(result.verdict)} {result.verdict}
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
                    <div className="text-lg font-mono text-orange-400">
                      {result.timeline}
                    </div>
                    <div className="text-sm text-muted-foreground">Timeline</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-red-400 font-mono">
                    Impact: {result.impact}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crisis Flowchart */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-orange-400">
                  Crisis Event Chain
                  <span className="text-sm text-muted-foreground ml-2">(AI-Generated Causal Flow)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.flowchart.map((step, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50">
                        <span className="text-sm font-mono text-orange-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 p-3 bg-slate-900/30 rounded-lg border border-orange-500/20">
                        <p className="text-sm">{step}</p>
                      </div>
                      {index < result.flowchart.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-orange-400 mt-3" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Mitigation Protocol */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-green-400">
                  AI-Generated Mitigation Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {result.mitigations.map((mitigation, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-green-500/10 rounded-lg border border-green-500/30"
                    >
                      <p className="text-sm text-green-400">{mitigation}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Evidence Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-green-400">✅ Supporting Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.supportingPoints.map((point, index) => (
                      <div key={index} className="p-2 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-sm text-green-300">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-red-400">❌ Counter Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.counterPoints.map((point, index) => (
                      <div key={index} className="p-2 bg-red-500/10 rounded border border-red-500/20">
                        <p className="text-sm text-red-300">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Sources */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  Live Intelligence Sources
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
                        className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer transition-colors"
                        onClick={() => source.startsWith('http') && window.open(source, '_blank')}
                      >
                        {source}
                        {source.startsWith('http') && <ExternalLink className="w-3 h-3 ml-1" />}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
