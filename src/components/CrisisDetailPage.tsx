
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users, 
  ExternalLink,
  Share2,
  BookOpen,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CrisisDetailPageProps {
  crisisStep: string;
  onBack: () => void;
}

interface ExpertOpinion {
  expert: string;
  quote: string;
  credibility: string;
}

interface DataSource {
  name: string;
  url: string;
  reliability: number;
}

interface AnalysisData {
  title: string;
  severity: number;
  probability: number;
  timeframe: string;
  affectedPopulation: string;
  economicImpact: string;
  detailedAnalysis: {
    root_causes: string[];
    escalation_factors: string[];
    cascading_effects: string[];
    historical_precedents: string[];
  };
  realTimeData: Record<string, string>;
  expertOpinions: ExpertOpinion[];
  sources: DataSource[];
}

export const CrisisDetailPage = ({ crisisStep, onBack }: CrisisDetailPageProps) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-powered deep analysis
    const fetchDeepAnalysis = async () => {
      setLoading(true);
      
      // Simulate API call to Perplexity Sonar for comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: AnalysisData = {
        title: crisisStep,
        severity: 78,
        probability: 85,
        timeframe: "3-6 months",
        affectedPopulation: "45M people",
        economicImpact: "€120B GDP loss",
        detailedAnalysis: {
          root_causes: [
            "Climate change accelerating drought patterns in Mediterranean region",
            "Aging agricultural infrastructure unable to cope with extreme weather",
            "EU Common Agricultural Policy gaps in drought preparedness",
            "Water table depletion exceeding natural recharge rates by 40%"
          ],
          escalation_factors: [
            "Rising global food commodity prices creating market volatility",
            "Political tensions between rural and urban constituencies",
            "Media amplification of agricultural crisis narratives",
            "Social media coordination of protest movements"
          ],
          cascading_effects: [
            "Supply chain disruptions affecting food distribution networks",
            "Insurance market instability due to agricultural losses",
            "Banking sector exposure to agricultural loan defaults",
            "Tourism industry secondary impacts from rural economic decline"
          ],
          historical_precedents: [
            "2012 US Midwest drought - Economic losses exceeded $100B",
            "2003 European heat wave - Agricultural output dropped 30%",
            "1930s Dust Bowl - Mass population displacement and political upheaval",
            "2010 Russian grain crisis - Export bans triggered global food riots"
          ]
        },
        realTimeData: {
          precipitation_deficit: "-65% below historical average",
          reservoir_levels: "At 23% capacity (critical threshold: 30%)",
          crop_yield_forecasts: "-40% for wheat, -35% for corn",
          commodity_prices: "Wheat futures up 45% in past 3 months"
        },
        expertOpinions: [
          {
            expert: "Dr. Elena Vasquez, EU Climate Research Institute",
            quote: "This represents a fundamental shift in Mediterranean climate patterns that will require unprecedented adaptive responses.",
            credibility: "Leading climate adaptation researcher, 200+ peer-reviewed publications"
          },
          {
            expert: "Prof. Michael Chen, Agricultural Economics, Oxford",
            quote: "The confluence of climate stress and market volatility creates a perfect storm for rural economic collapse.",
            credibility: "Former UN Food & Agriculture Organization senior economist"
          }
        ],
        sources: [
          { name: "EU Climate Reports", url: "https://climate.ec.europa.eu", reliability: 95 },
          { name: "USDA Agricultural Data", url: "https://usda.gov", reliability: 92 },
          { name: "IMF Economic Forecasts", url: "https://imf.org", reliability: 88 },
          { name: "WHO Health Impact Assessments", url: "https://who.int", reliability: 90 }
        ]
      };
      
      setAnalysis(mockAnalysis);
      setLoading(false);
    };

    fetchDeepAnalysis();
  }, [crisisStep]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">AI Deep Analysis in Progress</h2>
            <p className="text-muted-foreground mb-6">
              Sonar AI is analyzing global data sources and historical patterns...
            </p>
            <Progress value={75} className="w-full max-w-md mx-auto" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-6">
              Unable to load crisis analysis. Please try again.
            </p>
            <Button onClick={onBack} variant="outline" className="cyber-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Simulation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={onBack}
              variant="outline"
              className="cyber-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Simulation
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="cyber-button">
                <Share2 className="w-4 h-4 mr-2" />
                Share Analysis
              </Button>
              <Button variant="outline" className="cyber-button">
                <BookOpen className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-cyan-400 neon-text mb-4">
            Deep Crisis Analysis
          </h1>
          <p className="text-xl text-foreground mb-6">{analysis.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-red-400">
                {analysis.severity}%
              </div>
              <div className="text-sm text-muted-foreground">Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono text-orange-400">
                {analysis.probability}%
              </div>
              <div className="text-sm text-muted-foreground">Probability</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-yellow-400">
                {analysis.timeframe}
              </div>
              <div className="text-sm text-muted-foreground">Timeframe</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-cyan-400">
                {analysis.affectedPopulation}
              </div>
              <div className="text-sm text-muted-foreground">Affected</div>
            </div>
          </div>
        </div>

        {/* Real-time Data */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Real-time Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.realTimeData).map(([key, value], index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                  <div className="text-sm text-cyan-400 font-medium">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-lg font-mono text-foreground mt-1">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Root Causes */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-orange-400">Root Causes Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.detailedAnalysis.root_causes.map((cause: string, index: number) => (
                  <div key={index} className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <p className="text-sm">{cause}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Escalation Factors */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-red-400">Escalation Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.detailedAnalysis.escalation_factors.map((factor: string, index: number) => (
                  <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <p className="text-sm">{factor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cascading Effects */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-yellow-400">Cascading Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.detailedAnalysis.cascading_effects.map((effect: string, index: number) => (
                  <div key={index} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <p className="text-sm">{effect}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historical Precedents */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-purple-400">Historical Precedents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.detailedAnalysis.historical_precedents.map((precedent: string, index: number) => (
                  <div key={index} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-sm">{precedent}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expert Opinions */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-green-400">Expert Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.expertOpinions.map((opinion: ExpertOpinion, index: number) => (
                <div key={index} className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <blockquote className="text-lg italic mb-2">
                    "{opinion.quote}"
                  </blockquote>
                  <div className="text-sm text-green-400 font-medium">{opinion.expert}</div>
                  <div className="text-xs text-muted-foreground">{opinion.credibility}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-cyan-400">Verified Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.sources.map((source: DataSource, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30 cursor-pointer"
                  onClick={() => window.open(source.url, '_blank')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-cyan-400">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Reliability: {source.reliability}%
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
