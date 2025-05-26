
class SonarPromptBuilder {
  static buildThreatDetectionPrompt() {
    return `
Analyze the current global situation and identify the top 5 emerging threats across these domains:
- Cyber warfare and AI attacks
- Pandemic and health crises  
- Climate disasters and resource conflicts
- Economic instability and supply chain disruption
- Geopolitical tensions and military conflicts
- Space weather and infrastructure threats

For each threat, provide:
1. Threat title (concise, urgent)
2. Severity score (0-100, where 90+ is existential)
3. Type/Category
4. Brief summary (2-3 sentences)
5. Geographic regions affected
6. Credible source citations
7. Timeline of emergence

Focus on threats that are:
- Currently developing or accelerating
- Have multi-domain impact potential
- Could cascade into larger crises
- Are being discussed by credible institutions (WHO, NATO, UN, etc.)

Return analysis in JSON format with structured data.
`;
  }

  static buildSimulationPrompt(scenario) {
    return `
CRISIS SIMULATION REQUEST: "${scenario}"

Conduct a comprehensive analysis of this hypothetical scenario using systems thinking:

1. CAUSAL CHAIN ANALYSIS:
   - Map out the logical sequence of events that would unfold
   - Identify key decision points and tipping points
   - Show how effects could cascade across domains

2. IMPACT ASSESSMENT:
   - Economic implications and market reactions
   - Social and political consequences
   - Infrastructure and security effects
   - International relations impact
   - Environmental consequences

3. MITIGATION STRATEGIES:
   - Immediate response measures (0-48 hours)
   - Short-term stabilization (1-4 weeks)
   - Long-term recovery (months-years)
   - Prevention strategies for similar scenarios

4. CONFIDENCE & SOURCES:
   - Assign confidence levels to each prediction
   - Cite relevant historical precedents
   - Reference expert analysis and research

Present findings in structured format with clear reasoning chains.
`;
  }

  static buildVerificationPrompt(claim) {
    return `
THREAT VERIFICATION ANALYSIS: "${claim}"

Conduct a rigorous fact-checking and credibility assessment:

1. EVIDENCE REVIEW:
   - Gather supporting evidence from credible sources
   - Identify contradictory evidence or alternative explanations
   - Check for confirmation bias or information gaps

2. SOURCE ANALYSIS:
   - Evaluate source credibility and expertise
   - Check for potential conflicts of interest
   - Cross-reference multiple independent sources

3. LOGICAL ASSESSMENT:
   - Test claim against known facts and patterns
   - Identify logical fallacies or unsupported leaps
   - Consider alternative explanations

4. VERDICT:
   - Assign credibility score (0-100%)
   - Provide confidence interval
   - Explain reasoning for assessment
   - Highlight areas needing further investigation

5. CONTEXTUAL FACTORS:
   - Historical precedents
   - Current geopolitical context
   - Technological and scientific constraints

Return structured analysis with clear verdict and reasoning.
`;
  }

  static buildTrendAnalysisPrompt(timeframe = '30 days') {
    return `
GLOBAL THREAT TREND ANALYSIS (${timeframe})

Analyze current threat patterns and emerging trends:

1. THREAT EVOLUTION:
   - How have existing threats changed in severity?
   - What new threat vectors have emerged?
   - Which threats are accelerating vs. stabilizing?

2. GEOGRAPHIC HOTSPOTS:
   - Identify regions with increasing instability
   - Map threat migration patterns
   - Highlight unexpected threat locations

3. DOMAIN ANALYSIS:
   - Cyber threat landscape changes
   - Health security developments
   - Climate and resource stress patterns
   - Economic vulnerability shifts

4. INTERCONNECTION MAPPING:
   - How are different threats reinforcing each other?
   - Identify cascade risk patterns
   - Spot emerging threat convergence zones

5. PREDICTIVE INDICATORS:
   - Early warning signals to monitor
   - Threshold levels for concern
   - Probability assessments for escalation

Provide data-driven analysis with trend indicators and forecasting.
`;
  }
}

module.exports = SonarPromptBuilder;
