
class SonarPromptBuilder {
  static buildSimulationPrompt(scenario) {
    return `Conduct a comprehensive crisis simulation analysis for the following scenario:

SCENARIO: ${scenario}

Please provide a detailed analysis including:

1. CAUSAL CHAIN ANALYSIS:
   - Initial trigger mechanisms
   - Primary escalation pathways
   - Secondary effect propagation
   - System interaction points
   - Terminal outcome scenarios

2. MITIGATION PROTOCOLS:
   - Immediate response measures
   - Short-term stabilization actions
   - Medium-term recovery strategies
   - Long-term prevention systems
   - International coordination requirements

3. IMPACT ASSESSMENT:
   - Economic consequences and scale
   - Social disruption potential
   - Political stability implications
   - Environmental considerations
   - Timeline of effects emergence

4. CONFIDENCE FACTORS:
   - Historical precedent strength
   - Data availability and quality
   - Model accuracy limitations
   - Uncertainty quantification

5. DATA SOURCES:
   - Primary intelligence feeds
   - Academic research foundations
   - Government agency reports
   - International organization assessments

Format the response with clear section headers and actionable insights. Include specific time estimates and affected population numbers where possible.`;
  }

  static buildDeepAnalysisPrompt(crisisStep, analysisType) {
    const typePrompts = {
      'root_cause': `Conduct a deep root cause analysis of: "${crisisStep}"

Examine:
- Fundamental system vulnerabilities
- Historical precedent patterns
- Structural weaknesses
- Policy gaps or failures
- Environmental/economic triggers
- Human factors and decision points

Provide specific evidence and data sources.`,

      'escalation_factor': `Analyze escalation factors for: "${crisisStep}"

Investigate:
- Amplification mechanisms
- Feedback loops and cascades
- Network effects and contagion
- Decision-making pressure points
- Information flow disruptions
- Resource competition dynamics

Include real-world examples and quantitative assessments.`,

      'cascading_effect': `Evaluate cascading effects of: "${crisisStep}"

Map:
- Primary impact domains
- Secondary effect propagation
- System interdependencies
- Critical infrastructure impacts
- Economic ripple effects
- Social and political consequences

Provide timeline estimates and affected populations.`,

      'historical_precedent': `Research historical precedents for: "${crisisStep}"

Compare:
- Similar crisis events and outcomes
- Response effectiveness analysis
- Lessons learned documentation
- Pattern recognition insights
- Successful mitigation examples
- Failed intervention attempts

Include specific dates, locations, and outcome data.`
    };

    return typePrompts[analysisType] || typePrompts['root_cause'];
  }

  static buildRealTimePrompt(queryType, parameters = {}) {
    const prompts = {
      'threat_monitoring': `Monitor current global threat landscape focusing on:
- Emerging cyber security incidents
- Geopolitical tension escalations  
- Health emergencies and pandemics
- Climate-related disasters
- Economic instability indicators
- Social unrest patterns

Provide severity assessments and trend analysis.`,

      'intelligence_gathering': `Gather current intelligence on:
${parameters.focus || 'global security threats'}

Include:
- Recent developments and timeline
- Key stakeholder positions
- Risk assessment metrics
- Intervention opportunities
- Monitoring recommendations`,

      'crisis_update': `Provide real-time update on ongoing crisis:
${parameters.crisisId || 'current situation'}

Focus on:
- Latest developments
- Escalation or de-escalation trends
- Response effectiveness
- Emerging complications
- Next steps recommendations`
    };

    return prompts[queryType] || prompts['threat_monitoring'];
  }
}

module.exports = SonarPromptBuilder;
