
import { authClient } from '../api/authClient';

class SonarAnalysisService {
  static async analyzeComplexCause(item, type) {
    try {
      const prompt = this.buildAnalysisPrompt(item, type);
      
      const response = await authClient.post('/api/analysis/sonar-deep', {
        prompt,
        analysisType: type,
        subject: item
      });

      return {
        success: true,
        analysis: response.data.analysis,
        sources: response.data.sources || [],
        confidence: response.data.confidence || 85
      };
    } catch (error) {
      console.error('Sonar analysis failed:', error);
      return {
        success: false,
        analysis: this.generateFallbackAnalysis(item, type),
        sources: ['fallback-analysis.com'],
        confidence: 60
      };
    }
  }

  static buildAnalysisPrompt(item, type) {
    const prompts = {
      'root_cause': `
        Conduct a comprehensive deep-dive analysis of this root cause: "${item}"
        
        Provide:
        1. SYSTEMIC ANALYSIS: How does this cause operate within larger systems?
        2. HISTORICAL CONTEXT: When has this pattern emerged before and with what outcomes?
        3. INTERCONNECTIONS: What other factors amplify or mitigate this cause?
        4. EVIDENCE BASE: What data, research, and expert analysis supports this assessment?
        5. POLICY IMPLICATIONS: What governance and policy responses could address this?
        6. TIMELINE FACTORS: How does this cause develop and manifest over time?
        
        Use current data, academic research, and expert opinions. Cite specific sources.
      `,
      'escalation_factor': `
        Analyze this escalation factor in detail: "${item}"
        
        Provide:
        1. ACCELERATION MECHANISMS: How does this factor speed up crisis development?
        2. THRESHOLD ANALYSIS: At what points does this factor become critical?
        3. FEEDBACK LOOPS: How does this create self-reinforcing cycles?
        4. INTERVENTION POINTS: Where can this escalation be interrupted?
        5. CASE STUDIES: Real-world examples of this escalation pattern
        6. EARLY WARNING INDICATORS: What signals precede this escalation?
        
        Focus on actionable intelligence and intervention strategies.
      `,
      'cascading_effect': `
        Examine this cascading effect comprehensively: "${item}"
        
        Provide:
        1. CASCADE MECHANICS: How does this effect spread across domains?
        2. NETWORK ANALYSIS: What systems and connections enable this cascade?
        3. AMPLIFICATION FACTORS: What makes this cascade more severe?
        4. CONTAINMENT STRATEGIES: How can cascade spread be limited?
        5. SECONDARY IMPACTS: What indirect effects emerge from this cascade?
        6. RESILIENCE FACTORS: What makes systems resistant to this cascade?
        
        Include specific examples and quantitative data where available.
      `,
      'historical_precedent': `
        Conduct deep historical analysis of this precedent: "${item}"
        
        Provide:
        1. DETAILED CHRONOLOGY: Step-by-step breakdown of how this unfolded
        2. KEY ACTORS: Who were the critical decision-makers and stakeholders?
        3. TURNING POINTS: What were the pivotal moments that determined outcomes?
        4. LESSONS LEARNED: What insights can inform current crisis management?
        5. PATTERN RECOGNITION: How does this precedent relate to current situations?
        6. COUNTERFACTUAL ANALYSIS: What alternative outcomes were possible?
        
        Use primary sources, academic analysis, and expert retrospectives.
      `
    };

    return prompts[type] || prompts['root_cause'];
  }

  static generateFallbackAnalysis(item, type) {
    const fallbacks = {
      'root_cause': `This root cause represents a fundamental vulnerability in the system. Analysis of "${item}" reveals multiple interconnected factors that contribute to crisis emergence. Historical patterns suggest this type of root cause has been present in previous major disruptions, often operating beneath the surface before becoming apparent during crisis events.`,
      'escalation_factor': `This escalation factor serves as a crisis accelerator. "${item}" typically emerges during the middle phases of crisis development, transforming manageable situations into critical emergencies. Understanding this factor's timing and triggers is essential for early intervention strategies.`,
      'cascading_effect': `This cascading effect demonstrates how localized problems can spread across interconnected systems. "${item}" represents a pattern where initial impacts in one domain trigger secondary and tertiary effects in related systems, often with amplifying consequences.`,
      'historical_precedent': `This historical precedent provides valuable insights into crisis patterns. "${item}" represents a documented case that shares structural similarities with current scenarios, offering lessons about decision-making, outcomes, and alternative approaches that were available.`
    };

    return fallbacks[type] || fallbacks['root_cause'];
  }
}

export default SonarAnalysisService;
