
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSimulate } from '../hooks/useThreats';
import { Brain, ArrowRight, AlertTriangle, Lightbulb, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  threat?: {
    id: string;
    title: string;
    type: string;
    summary: string;
  } | null;
}

interface SimulationResult {
  scenario: string;
  impactChain: string[];
  mitigations: string[];
  sources: string[];
  confidence: number;
  timeframe: string;
}

export const SimulationModal = ({ isOpen, onClose, threat }: SimulationModalProps) => {
  const [scenario, setScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  const simulateMutation = useSimulate();

  const handleSubmit = async () => {
    if (!scenario.trim()) return;

    try {
      const response = await simulateMutation.mutateAsync({
        scenario: scenario.trim(),
        threatId: threat?.id,
        context: threat ? `Based on: ${threat.title} - ${threat.summary}` : undefined
      });
      
      setSimulationResult(response.data);
    } catch (error) {
      console.error('Simulation failed:', error);
      // Handle error - maybe show a toast
    }
  };

  const resetSimulation = () => {
    setScenario('');
    setSimulationResult(null);
  };

  const handleClose = () => {
    resetSimulation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto cyber-card border-2 border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
            <Brain className="w-8 h-8 mr-3 animate-pulse-glow" />
            AI Predictive Simulation Engine
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Context Card */}
          {threat && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="cyber-card border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-cyan-400 mb-1">
                        Base Threat Context
                      </h3>
                      <p className="text-sm font-medium">{threat.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{threat.summary}</p>
                    </div>
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400">
                      {threat.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Scenario Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-cyan-400 mb-2 block">
                Scenario to Simulate
              </label>
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder={
                  threat 
                    ? `How might "${threat.title}" escalate? What are the potential consequences?`
                    : "Describe a hypothetical scenario to simulate (e.g., 'What if major undersea internet cables are severed?')"
                }
                className="min-h-[100px] bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500"
                disabled={simulateMutation.isPending}
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                AI will analyze potential impact chains, consequences, and mitigation strategies
              </p>
              <div className="flex space-x-2">
                {simulationResult && (
                  <Button
                    onClick={resetSimulation}
                    variant="outline"
                    className="cyber-button"
                  >
                    New Simulation
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!scenario.trim() || simulateMutation.isPending}
                  className="cyber-button"
                >
                  {simulateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Simulation Results */}
          <AnimatePresence>
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Confidence & Timeframe */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="cyber-card border-green-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-mono text-green-400 mb-1">
                        {simulationResult.confidence}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Prediction Confidence
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cyber-card border-orange-500/30">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-mono text-orange-400 mb-1">
                        {simulationResult.timeframe}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Timeframe
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Impact Chain */}
                <Card className="cyber-card border-red-500/30">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Predicted Impact Chain
                    </h3>
                    <div className="space-y-3">
                      {simulationResult.impactChain.map((impact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <div className="text-cyan-400 font-mono text-sm min-w-[2rem]">
                            {index + 1}.
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
                            {impact}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mitigations */}
                <Card className="cyber-card border-green-500/30">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Recommended Mitigations
                    </h3>
                    <div className="grid gap-3">
                      {simulationResult.mitigations.map((mitigation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="p-4 bg-green-500/10 rounded-lg border border-green-500/30"
                        >
                          <div className="flex items-start space-x-3">
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 mt-1">
                              {index + 1}
                            </Badge>
                            <div className="flex-1 text-sm">{mitigation}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sources */}
                {simulationResult.sources.length > 0 && (
                  <Card className="cyber-card border-cyan-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Reference Sources
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {simulationResult.sources.map((source, index) => (
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
