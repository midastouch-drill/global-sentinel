
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Eye, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  id: string;
  subject: string;
  type: string;
  findings: string[];
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  threatTitle: string;
}

export const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
  isOpen,
  onClose,
  result,
  threatTitle
}) => {
  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto cyber-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center">
            <Brain className="w-8 h-8 mr-3 animate-pulse" />
            Deep Analysis Results
          </DialogTitle>
          <p className="text-muted-foreground">AI-powered threat analysis for: {threatTitle}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Confidence Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="cyber-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-mono text-cyan-400 mb-2">
                  {result.confidence}%
                </div>
                <div className="text-sm text-muted-foreground">Analysis Confidence</div>
                <Progress value={result.confidence} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-mono text-green-400 mb-2">
                  {result.findings.length}
                </div>
                <div className="text-sm text-muted-foreground">Key Findings</div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-mono text-orange-400 mb-2">
                  {result.riskFactors.length}
                </div>
                <div className="text-sm text-muted-foreground">Risk Factors</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Findings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.findings.map((finding, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-300">{finding}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Factors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.riskFactors.map((risk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{risk}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                    >
                      <p className="text-sm text-purple-300">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-between items-center text-sm text-muted-foreground"
          >
            <div>Analysis Type: {result.type}</div>
            <div>Generated: {new Date(result.timestamp).toLocaleString()}</div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              AI Powered
            </Badge>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
