
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Zap, Target, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulationResult {
  scenario: string;
  causalTree: string[];
  mitigationProtocol: string[];
  confidence: number;
  timeline: string;
  impact: string;
  sources: string[];
}

export const CrisisSimulator = () => {
  const [scenario, setScenario] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const demoScenario = "Southern Europe is showing signs of impending drought-induced political instability.";

  const mockSimulationResult: SimulationResult = {
    scenario: demoScenario,
    causalTree: [
      "Severe drought conditions reduce agricultural output by 40%",
      "Food prices increase by 60% across Southern European markets",
      "Rural unemployment rises to 25% in affected regions",
      "Mass migration from rural to urban areas begins",
      "Urban infrastructure becomes strained, services deteriorate",
      "Social unrest emerges in major cities",
      "Political parties exploit crisis, polarization increases",
      "Government stability threatened, early elections called"
    ],
    mitigationProtocol: [
      "Immediate: Activate EU Agricultural Emergency Fund",
      "Short-term: Implement water conservation protocols",
      "Medium-term: Establish rural employment programs",
      "Long-term: Invest in drought-resistant agriculture",
      "Policy: Create regional migration support systems",
      "Diplomatic: Coordinate with North African nations for resource sharing"
    ],
    confidence: 76,
    timeline: "6-18 months for full crisis emergence",
    impact: "Regional destabilization affecting 120M people, €340B economic impact",
    sources: ["EU Climate Reports", "IMF Economic Analysis", "WHO Migration Studies", "Historical Conflict Data"]
  };

  const runSimulation = async () => {
    if (!scenario.trim()) {
      toast({
        title: "⚠️ Scenario Required",
        description: "Please enter a crisis scenario to simulate",
        variant: "destructive"
      });
      return;
    }

    setIsSimulating(true);
    
    toast({
      title: "🧠 AI Simulation Initiated",
      description: "Running Perplexity Sonar deep analysis...",
    });

    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    setResult(mockSimulationResult);
    setIsSimulating(false);

    toast({
      title: "✅ Simulation Complete",
      description: "Crisis pathway analysis generated",
    });
  };

  const loadDemoScenario = () => {
    setScenario(demoScenario);
  };

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Brain className="w-8 h-8 mr-3 animate-pulse-glow" />
              Crisis Simulation Engine
            </h2>
            <p className="text-muted-foreground">
              AI-powered scenario modeling using Perplexity Sonar reasoning
            </p>
          </div>
          
          <Button 
            onClick={loadDemoScenario}
            variant="outline"
            className="cyber-button"
          >
            <Target className="w-4 h-4 mr-2" />
            Load Demo
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-cyan-400">
              Crisis Scenario
            </label>
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Enter a potential crisis scenario for AI analysis..."
              className="mt-2 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500 text-foreground min-h-[100px]"
            />
          </div>

          <Button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="cyber-button w-full"
          >
            {isSimulating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Simulating Crisis Pathway...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run AI Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Simulation Results */}
      {result && (
        <div className="space-y-6">
          {/* Scenario Overview */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Scenario Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                <p className="text-foreground">{result.scenario}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <div className="text-center">
                  <div className="text-sm font-mono text-red-400">
                    {result.impact}
                  </div>
                  <div className="text-sm text-muted-foreground">Impact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Causal Tree */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-orange-400">
                Crisis Pathway Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.causalTree.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50">
                      <span className="text-sm font-mono text-orange-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 p-3 bg-slate-900/30 rounded-lg border border-orange-500/20">
                      <p className="text-sm">{step}</p>
                    </div>
                    {index < result.causalTree.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-orange-400 mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mitigation Protocol */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-green-400">
                AI-Generated Mitigation Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {result.mitigationProtocol.map((protocol, index) => (
                  <div key={index} className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-sm text-green-400">{protocol}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
