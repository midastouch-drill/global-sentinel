
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, Zap, Target, ArrowRight, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CrisisDetailPage } from './CrisisDetailPage';
import { motion } from 'framer-motion';

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
  const [selectedCrisisStep, setSelectedCrisisStep] = useState<string | null>(null);
  const [selectedMitigation, setSelectedMitigation] = useState<string | null>(null);
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

  const handleCrisisStepClick = (step: string) => {
    setSelectedCrisisStep(step);
  };

  const handleMitigationClick = (mitigation: string) => {
    setSelectedMitigation(mitigation);
  };

  const handleSourceClick = (source: string) => {
    const sourceUrls: Record<string, string> = {
      "EU Climate Reports": "https://climate.ec.europa.eu/eu-action/adaptation-climate-change_en",
      "IMF Economic Analysis": "https://www.imf.org/en/Publications/WEO",
      "WHO Migration Studies": "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
      "Historical Conflict Data": "https://www.sipri.org/databases"
    };
    
    if (sourceUrls[source]) {
      window.open(sourceUrls[source], '_blank');
    }
  };

  // Show crisis detail page if a step is selected
  if (selectedCrisisStep) {
    return (
      <CrisisDetailPage 
        crisisStep={selectedCrisisStep}
        onBack={() => setSelectedCrisisStep(null)}
      />
    );
  }

  // Show mitigation detail page if mitigation is selected
  if (selectedMitigation) {
    return (
      <CrisisDetailPage 
        crisisStep={selectedMitigation}
        onBack={() => setSelectedMitigation(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
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
      </motion.div>

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

          {/* Causal Tree - Now Clickable */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-orange-400">
                Crisis Pathway Analysis
                <span className="text-sm text-muted-foreground ml-2">(Click any step for detailed analysis)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.causalTree.map((step, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-start space-x-3 cursor-pointer"
                    onClick={() => handleCrisisStepClick(step)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/50">
                      <span className="text-sm font-mono text-orange-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 p-3 bg-slate-900/30 rounded-lg border border-orange-500/20 hover:border-orange-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm flex-1">{step}</p>
                        <ExternalLink className="w-4 h-4 text-orange-400 ml-2" />
                      </div>
                    </div>
                    {index < result.causalTree.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-orange-400 mt-3" />
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mitigation Protocol - Now Clickable */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-green-400">
                AI-Generated Mitigation Protocol
                <span className="text-sm text-muted-foreground ml-2">(Click any protocol for detailed implementation)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {result.mitigationProtocol.map((protocol, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-colors cursor-pointer"
                    onClick={() => handleMitigationClick(protocol)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-400 flex-1">{protocol}</p>
                      <ExternalLink className="w-4 h-4 text-green-400 ml-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sources - Now Clickable */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Data Sources
                <span className="text-sm text-muted-foreground ml-2">(Click to visit source)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      variant="outline"
                      className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer transition-colors"
                      onClick={() => handleSourceClick(source)}
                    >
                      {source}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
