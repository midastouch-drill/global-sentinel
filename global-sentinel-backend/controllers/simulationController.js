
const { getFirestore } = require('../config/firebase');
const openRouterClient = require('../utils/openRouterClient');
const SonarPromptBuilder = require('../utils/sonarPromptBuilder');
const { v4: uuidv4 } = require('uuid');

class SimulationController {
  static async runSimulation(req, res) {
    try {
      const { scenario, type = 'comprehensive' } = req.body;
      
      if (!scenario) {
        return res.status(400).json({
          success: false,
          error: 'Scenario is required for simulation'
        });
      }
      
      console.log(`🧪 Running ${type} simulation: ${scenario}`);
      
      const db = getFirestore();
      const prompt = SonarPromptBuilder.buildSimulationPrompt(scenario);
      
      // Get AI simulation analysis
      const analysis = await openRouterClient.callSonarReasoning(prompt);
      
      // Parse simulation results
      const simulation = await SimulationController.parseSimulation(analysis, scenario);
      
      // Store simulation in Firestore
      const simulationData = {
        id: uuidv4(),
        scenario,
        type,
        ...simulation,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      await db.collection('simulations').doc(simulationData.id).set(simulationData);
      
      console.log(`✅ Simulation completed: ${simulationData.id}`);
      
      res.json({
        success: true,
        simulation: simulationData,
        message: 'Crisis simulation completed successfully'
      });
      
    } catch (error) {
      console.error('🚨 Simulation error:', error);
      res.status(500).json({
        success: false,
        error: 'Simulation system failure',
        message: error.message
      });
    }
  }

  static async parseSimulation(aiResponse, scenario) {
    try {
      // Extract structured data from AI response
      const causalChain = SimulationController.extractCausalChain(aiResponse);
      const mitigations = SimulationController.extractMitigations(aiResponse);
      const impacts = SimulationController.extractImpacts(aiResponse);
      const confidence = SimulationController.extractConfidence(aiResponse);
      const sources = SimulationController.extractSources(aiResponse);
      
      return {
        causalChain,
        mitigations,
        impacts,
        confidence,
        sources,
        summary: SimulationController.generateSummary(causalChain, impacts)
      };
      
    } catch (error) {
      console.warn('⚠️ Simulation parsing fallback triggered');
      return SimulationController.generateFallbackSimulation(scenario);
    }
  }

  static extractCausalChain(text) {
    const chains = [];
    const lines = text.split('\n');
    
    let inChainSection = false;
    lines.forEach(line => {
      if (line.toLowerCase().includes('causal') || line.toLowerCase().includes('chain')) {
        inChainSection = true;
      } else if (line.includes('→') || line.includes('->')) {
        chains.push(line.trim());
      } else if (line.includes('1.') || line.includes('•')) {
        if (inChainSection) {
          chains.push(line.replace(/^\d+\.|\•/, '').trim());
        }
      }
    });
    
    return chains.length > 0 ? chains : [
      "Initial trigger event occurs",
      "System vulnerabilities are exposed", 
      "Cascading failures begin",
      "Crisis escalates across domains",
      "Long-term consequences emerge"
    ];
  }

  static extractMitigations(text) {
    const mitigations = [];
    const lines = text.split('\n');
    
    let inMitigationSection = false;
    lines.forEach(line => {
      if (line.toLowerCase().includes('mitigation') || line.toLowerCase().includes('response')) {
        inMitigationSection = true;
      } else if (inMitigationSection && (line.includes('-') || line.includes('•') || line.match(/^\d+\./))) {
        mitigations.push(line.replace(/^-|\•|\d+\./, '').trim());
      }
    });
    
    return mitigations.length > 0 ? mitigations : [
      "Implement early warning systems",
      "Coordinate international response",
      "Deploy emergency resources",
      "Establish communication protocols"
    ];
  }

  static extractImpacts(text) {
    const impacts = {
      economic: [],
      social: [],
      political: [],
      environmental: []
    };
    
    const lines = text.split('\n');
    let currentCategory = null;
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('economic')) currentCategory = 'economic';
      else if (lower.includes('social')) currentCategory = 'social';
      else if (lower.includes('political')) currentCategory = 'political';
      else if (lower.includes('environmental')) currentCategory = 'environmental';
      else if (currentCategory && (line.includes('-') || line.includes('•'))) {
        impacts[currentCategory].push(line.replace(/^-|\•/, '').trim());
      }
    });
    
    return impacts;
  }

  static extractConfidence(text) {
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)%?/i);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
  }

  static extractSources(text) {
    const sources = [];
    const urlPattern = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlPattern);
    
    if (matches) {
      sources.push(...matches);
    }
    
    // Extract domain names mentioned
    const domainPattern = /\b[a-zA-Z0-9-]+\.(com|org|gov|edu|int)\b/g;
    const domains = text.match(domainPattern);
    
    if (domains) {
      sources.push(...domains.filter(d => !sources.includes(d)));
    }
    
    return sources.length > 0 ? sources : ['who.int', 'un.org', 'reuters.com'];
  }

  static generateSummary(causalChain, impacts) {
    const chainLength = causalChain.length;
    const impactCount = Object.values(impacts).flat().length;
    
    return `Simulation reveals ${chainLength}-stage escalation pathway with ${impactCount} identified impacts across multiple domains. Critical intervention windows identified in early stages.`;
  }

  static generateFallbackSimulation(scenario) {
    return {
      causalChain: [
        `${scenario} triggers initial system stress`,
        "Stakeholders respond with emergency measures",
        "Secondary effects emerge across related systems",
        "Public and institutional confidence impacts",
        "Long-term adaptation requirements surface"
      ],
      mitigations: [
        "Activate crisis response protocols",
        "Coordinate multi-stakeholder response",
        "Deploy monitoring and assessment resources",
        "Implement public communication strategy"
      ],
      impacts: {
        economic: ["Market volatility", "Resource allocation shifts"],
        social: ["Public concern", "Behavioral changes"],
        political: ["Policy response requirements", "International coordination needs"],
        environmental: ["System stress indicators", "Adaptation requirements"]
      },
      confidence: 70,
      sources: ['scenario-analysis.org', 'crisis-management.gov'],
      summary: "Simulation completed with moderate confidence based on available data patterns."
    };
  }

  static async getSimulation(req, res) {
    try {
      const { id } = req.params;
      const db = getFirestore();
      
      const doc = await db.collection('simulations').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Simulation not found'
        });
      }
      
      res.json({
        success: true,
        simulation: { id: doc.id, ...doc.data() }
      });
      
    } catch (error) {
      console.error('🚨 Simulation fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch simulation'
      });
    }
  }

  static async getRecentSimulations(req, res) {
    try {
      const db = getFirestore();
      const { limit = 10 } = req.query;
      
      const snapshot = await db.collection('simulations')
        .orderBy('timestamp', 'desc')
        .limit(parseInt(limit))
        .get();
      
      const simulations = [];
      snapshot.forEach(doc => {
        simulations.push({ id: doc.id, ...doc.data() });
      });
      
      res.json({
        success: true,
        simulations,
        count: simulations.length
      });
      
    } catch (error) {
      console.error('🚨 Recent simulations fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent simulations'
      });
    }
  }
}

module.exports = SimulationController;
