import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Brain, 
  Search, 
  Zap, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulate } from '@/hooks/useThreats';
import { threatsApi } from '@/api/threats';

interface SimulationResult {
  scenario: string;
  causalChain: string[];
  mitigationProtocol: string[];
  confidence: number;
  timeline: string;
  impact: string;
  sources: string[];
}

interface CrisisAnalysis {
  scenario: string;
  causalTree: string[];
  riskFactors: string[];
  mitigationStrategies: string[];
  confidence: number;
  severity: string;
  timeframe: string;
  affectedRegions: string[];
  sources: string[];
}

const SimulationLab = () => {
  const [activeTab, setActiveTab] = useState('simulator');
  const [scenario, setScenario] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [crisisAnalysis, setCrisisAnalysis] = useState<CrisisAnalysis | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const simulateMutation = useSimulate();

  const runSimulation = async () => {
    if (!scenario.trim()) return;
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStep('Initializing simulation...');
    
    // Simulate progress
    const progressSteps = [
      'Analyzing threat scenario...',
      'Building causal relationship tree...',
      'Computing impact vectors...',
      'Generating mitigation strategies...',
      'Finalizing simulation results...'
    ];
    
    for (let i = 0; i < progressSteps.length; i++) {
      setCurrentStep(progressSteps[i]);
      setProgress(((i + 1) / progressSteps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      const response = await simulateMutation.mutateAsync({
        scenario
      });
      
      setSimulationResult(response.data.result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      setCurrentStep('Simulation complete');
    }
  };

  const runCrisisAnalysis = async () => {
    if (!scenario.trim()) return;
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStep('Starting crisis pathway analysis...');
    
    try {
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const response = await threatsApi.analyzeCrisis({
        scenario,
        analysisType: 'pathway'
      });
      
      setCrisisAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Crisis analysis failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      setCurrentStep('Analysis complete');
    }
  };

  const runDeepAnalysis = async (crisisStep: string) => {
    if (!crisisStep.trim()) return;
    
    setIsRunning(true);
    setProgress(0);
    setCurrentStep('Conducting deep intelligence analysis...');
    
    try {
      for (let i = 0; i <= 100; i += 25) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const response = await threatsApi.deepAnalysis({
        crisisStep,
        analysisType: 'intelligence'
      });
      
      setDeepAnalysis(response.data);
    } catch (error) {
      console.error('Deep analysis failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      setCurrentStep('Deep analysis complete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Brain className="w-8 h-8 mr-3 animate-pulse-glow" />
              Global Threat Simulation Laboratory
            </h2>
            <p className="text-muted-foreground">
              Advanced AI-powered crisis simulation and deep intelligence analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="cyber-badge bg-green-500/20 text-green-400 border-green-500">
              <Zap className="w-3 h-3 mr-1" />
              Sonar AI Active
            </Badge>
            <Badge className="cyber-badge bg-purple-500/20 text-purple-400 border-purple-500">
              <Brain className="w-3 h-3 mr-1" />
              Gemini 2.0 Ready
            </Badge>
          </div>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400">{currentStep}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 cyber-tabs">
          <TabsTrigger value="simulator" className="cyber-tab">
            <Play className="w-4 h-4 mr-2" />
            Crisis Simulator
          </TabsTrigger>
          <TabsTrigger value="analysis" className="cyber-tab">
            <Target className="w-4 h-4 mr-2" />
            Crisis Analysis
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="cyber-tab">
            <Search className="w-4 h-4 mr-2" />
            Deep Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Crisis Simulator */}
        <TabsContent value="simulator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Panel */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Scenario Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Crisis Scenario
                  </label>
                  <Textarea
                    placeholder="Describe the threat scenario you want to simulate (e.g., 'Major cyber attack on critical infrastructure affecting power grids across multiple countries')"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="cyber-input min-h-[100px]"
                  />
                </div>
                
                <Button
                  onClick={runSimulation}
                  disabled={isRunning || !scenario.trim()}
                  className="w-full cyber-button bg-blue-600/20 text-blue-400 border-blue-500 hover:bg-blue-600/30"
                >
                  {isRunning ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Launch Simulation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {simulationResult ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">Causal Chain Analysis</h4>
                      <div className="space-y-2">
                        {simulationResult.causalChain.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Mitigation Protocol</h4>
                      <div className="space-y-1">
                        {simulationResult.mitigationProtocol.map((protocol, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>{protocol}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 text-cyan-400">{simulationResult.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeline:</span>
                        <span className="ml-2 text-cyan-400">{simulationResult.timeline}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a scenario and launch simulation to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crisis Pathway Analysis */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Crisis Pathway Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe the crisis scenario for pathway analysis..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="cyber-input min-h-[100px]"
                />
                
                <Button
                  onClick={runCrisisAnalysis}
                  disabled={isRunning || !scenario.trim()}
                  className="w-full cyber-button bg-orange-600/20 text-orange-400 border-orange-500 hover:bg-orange-600/30"
                >
                  {isRunning ? (
                    <>
                      <Target className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Crisis Pathway
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {crisisAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-400 mb-2">Causal Tree</h4>
                      <div className="space-y-1">
                        {crisisAnalysis.causalTree.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-orange-400" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Risk Factors</h4>
                      <div className="space-y-1">
                        {crisisAnalysis.riskFactors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 text-cyan-400">{crisisAnalysis.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Severity:</span>
                        <span className="ml-2 text-red-400">{crisisAnalysis.severity}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Run crisis analysis to see pathway results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deep Intelligence Analysis */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Deep Intelligence Query</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Intelligence Focus
                  </label>
                  <Input
                    placeholder="Enter search query or crisis element..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="cyber-input"
                  />
                </div>
                
                <Button
                  onClick={() => runDeepAnalysis(searchQuery)}
                  disabled={isRunning || !searchQuery.trim()}
                  className="w-full cyber-button bg-purple-600/20 text-purple-400 border-purple-500 hover:bg-purple-600/30"
                >
                  {isRunning ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Deep Analysis via Sonar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">Intelligence Report</CardTitle>
              </CardHeader>
              <CardContent>
                {deepAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">Analysis</h4>
                      <p className="text-sm leading-relaxed">{deepAnalysis.analysis}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Sources</h4>
                      <div className="space-y-1">
                        {deepAnalysis.sources?.map((source: string, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {source}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="text-cyan-400">{deepAnalysis.confidence}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter query for deep intelligence analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationLab;
