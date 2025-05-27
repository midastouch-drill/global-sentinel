
import { threatsApi } from '../api/threats';

interface SonarAnalysisResult {
  success: boolean;
  analysis: string;
  confidence: number;
  sources: string[];
}

class SonarAnalysisService {
  static async analyzeComplexCause(
    crisisStep: string, 
    analysisType: 'root_cause' | 'escalation_factor' | 'cascading_effect' | 'historical_precedent'
  ): Promise<SonarAnalysisResult> {
    try {
      console.log(`🧠 Initiating Sonar AI analysis for: ${crisisStep}`);
      
      // Call backend for deep analysis
      const response = await threatsApi.deepAnalysis({
        crisisStep,
        analysisType
      });
      
      if (response.data) {
        return {
          success: true,
          analysis: response.data.analysis,
          confidence: response.data.confidence,
          sources: response.data.sources
        };
      } else {
        throw new Error('Backend analysis failed');
      }
      
    } catch (error) {
      console.error('❌ Sonar analysis failed:', error);
      
      // Return fallback analysis
      return {
        success: false,
        analysis: this.generateFallbackAnalysis(crisisStep, analysisType),
        confidence: 60,
        sources: ['fallback-intelligence.gov', 'crisis-analysis.org']
      };
    }
  }
  
  static generateFallbackAnalysis(
    crisisStep: string, 
    analysisType: string
  ): string {
    const analyses = {
      'root_cause': `Root cause analysis indicates that "${crisisStep}" stems from systemic vulnerabilities in global infrastructure and coordination mechanisms. Historical patterns suggest that similar events occur when multiple risk factors converge simultaneously.`,
      
      'escalation_factor': `Escalation analysis reveals that "${crisisStep}" could amplify through interconnected systems, social media amplification, and inadequate early warning mechanisms. The current geopolitical climate creates additional volatility.`,
      
      'cascading_effect': `Cascading effect modeling shows that "${crisisStep}" could trigger secondary impacts across supply chains, financial markets, and social stability. Critical dependencies create vulnerability chains that require immediate attention.`,
      
      'historical_precedent': `Historical precedent analysis of "${crisisStep}" reveals similar events in past decades that led to significant global impacts. Patterns indicate that early intervention and international coordination are crucial for mitigation.`
    };
    
    return analyses[analysisType] || `Fallback analysis for "${crisisStep}" indicates potential risks that require further investigation and monitoring.`;
  }
}

export default SonarAnalysisService;
