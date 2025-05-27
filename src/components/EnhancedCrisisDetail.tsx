
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SonarAnalysisService from '../services/sonarAnalysisService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedCrisisDetailProps {
  crisisStep: string;
  analysisType: 'root_cause' | 'escalation_factor' | 'cascading_effect' | 'historical_precedent';
  onBack: () => void;
}

export const EnhancedCrisisDetail = ({ crisisStep, analysisType, onBack }: EnhancedCrisisDetailProps) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const { toast } = useToast();

  const analyzeWithSonar = async () => {
    setIsAnalyzing(true);
    
    toast({
      title: "🧠 Sonar AI Activated",
      description: "Conducting deep analysis with real-time data...",
    });

    try {
      const result = await SonarAnalysisService.analyzeComplexCause(crisisStep, analysisType);
      
      if (result.success) {
        // Simulate typing effect for the analysis
        await typeWriterEffect(result.analysis, setAnalysis);
        setSources(result.sources);
        setConfidence(result.confidence);
        setHasAnalyzed(true);
        
        toast({
          title: "✅ Analysis Complete",
          description: `Sonar AI analysis completed with ${result.confidence}% confidence`,
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast({
        title: "❌ Analysis Failed",
        description: "Unable to connect to Sonar AI. Using cached intelligence.",
        variant: "destructive",
      });
      
      // Fallback analysis
      await typeWriterEffect(SonarAnalysisService.generateFallbackAnalysis(crisisStep, analysisType), setAnalysis);
      setSources(['fallback-intelligence.gov', 'crisis-analysis.org']);
      setConfidence(60);
      setHasAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const typeWriterEffect = async (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter('');
    const words = text.split(' ');
    
    for (let i = 0; i <= words.length; i++) {
      const partial = words.slice(0, i).join(' ');
      setter(partial);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const getAnalysisTypeInfo = () => {
    const types = {
      'root_cause': {
        title: 'Root Cause Analysis',
        icon: '🔍',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
      },
      'escalation_factor': {
        title: 'Escalation Factor Analysis', 
        icon: '⚡',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      },
      'cascading_effect': {
        title: 'Cascading Effect Analysis',
        icon: '🌊',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      },
      'historical_precedent': {
        title: 'Historical Precedent Analysis',
        icon: '📚',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30'
      }
    };
    
    return types[analysisType];
  };

  const typeInfo = getAnalysisTypeInfo();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="cyber-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                onClick={onBack}
                variant="outline"
                className="cyber-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Badge className={`${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                {typeInfo.icon} {typeInfo.title}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-cyan-400 neon-text mb-4">
              Deep Intelligence Analysis
            </h1>
            
            <div className={`p-4 rounded-lg ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
              <h2 className="text-lg font-medium mb-2">Subject of Analysis:</h2>
              <p className="text-foreground">{crisisStep}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Trigger */}
        {!hasAnalyzed && (
          <Card className="cyber-card">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-cyan-400 mb-2">
                  Sonar AI Deep Analysis
                </h3>
                <p className="text-muted-foreground mb-6">
                  Activate real-time AI analysis powered by Perplexity Sonar for comprehensive intelligence gathering
                </p>
                
                <Button
                  onClick={analyzeWithSonar}
                  disabled={isAnalyzing}
                  className="cyber-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Activate Sonar Analysis
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="cyber-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">
                      Sonar AI Processing
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Analyzing global data sources and intelligence networks...
                    </p>
                    <Progress value={85} className="w-full max-w-md mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Results */}
        <AnimatePresence>
          {hasAnalyzed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Analysis Content */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Sonar AI Analysis
                    <Badge className="ml-2 bg-green-500/20 text-green-400">
                      {confidence}% Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="text-foreground leading-relaxed"
                    >
                      {analysis}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Intelligence Sources */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Intelligence Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sources.map((source, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
                        onClick={() => window.open(`https://${source}`, '_blank')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-medium">{source}</span>
                          <ExternalLink className="w-4 h-4 text-cyan-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
