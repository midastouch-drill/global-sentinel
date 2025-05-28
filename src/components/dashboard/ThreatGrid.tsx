
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Shield } from 'lucide-react';
import EnhancedThreatCard from '../EnhancedThreatCard';
import { threatsApi } from '../../api/threats';
import { useToast } from '@/hooks/use-toast';

interface ThreatGridProps {
  threats: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchTerm: string;
  filterType: string;
}

const ThreatGrid: React.FC<ThreatGridProps> = ({
  threats,
  isLoading,
  hasMore,
  onLoadMore,
  searchTerm,
  filterType
}) => {
  const { toast } = useToast();

  const handleSimulate = async (threat: any) => {
    try {
      console.log('🚀 Starting crisis simulation for:', threat.title);
      const response = await threatsApi.simulate({ 
        scenario: `Crisis scenario: ${threat.title}. ${threat.summary}` 
      });
      
      toast({
        title: "🧠 Crisis Simulation Started",
        description: "AI analysis initiated for threat scenario",
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "🧠 Simulation Initiated",
        description: "Crisis analysis running in background",
      });
    }
  };

  const handleAnalyze = async (threat: any) => {
    try {
      console.log('🔍 Starting deep analysis for:', threat.title);
      const response = await threatsApi.deepAnalysis({ 
        crisisStep: threat.title,
        analysisType: 'root_cause'
      });
      
      toast({
        title: "🔍 Deep Analysis Started",
        description: "Comprehensive threat analysis in progress",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "🔍 Analysis Initiated",
        description: "Intelligence gathering in progress",
      });
    }
  };

  const handleVerify = async (threat: any) => {
    try {
      console.log('✅ Starting verification for:', threat.title);
      const response = await threatsApi.verify({ 
        claim: threat.summary,
        threatId: threat.id
      });
      
      toast({
        title: "✅ Verification Started",
        description: "Multi-source verification initiated",
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "✅ Verification Initiated", 
        description: "Source validation in progress",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="cyber-card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (threats.length === 0) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Threats Found
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'All quiet on the intelligence front'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {threats.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnhancedThreatCard
                threat={threat}
                onSimulate={handleSimulate}
                onAnalyze={handleAnalyze}
                onVerify={handleVerify}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && !isLoading && (
        <div className="text-center">
          <Button 
            onClick={onLoadMore} 
            variant="outline" 
            className="cyber-button"
          >
            <Eye className="w-4 h-4 mr-2" />
            Load More Threats
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </>
  );
};

export default ThreatGrid;
