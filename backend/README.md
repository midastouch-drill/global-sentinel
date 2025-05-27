
# Global Sentinel Backend

## 🌍 Earth's AI Immune System - Backend Infrastructure

Global Sentinel is a revolutionary crisis monitoring and reasoning platform that combines AI analysis, real-time data, and public validation to detect and respond to global threats before they escalate.

### 🚀 Features

- **Threat Detection**: Real-time scanning using Perplexity Sonar AI
- **Crisis Simulation**: Scenario modeling with causal chain analysis  
- **Verification System**: AI-powered fact-checking with counter-analysis
- **Citizen Validation**: Crowdsourced threat verification with gamification
- **Trend Analysis**: Historical patterns and predictive forecasting
- **Chaos Index**: Quantified global stability metrics

### 🛠️ Technology Stack

- **Runtime**: Node.js + Express.js
- **Database**: Firebase Firestore
- **AI Integration**: OpenRouter API (Perplexity Sonar models)
- **Authentication**: Firebase Auth (optional)
- **Deployment**: Ready for Render, Heroku, or any cloud platform

### 📦 Installation

1. Clone and setup:
```bash
git clone <repository>
cd global-sentinel-backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Required Environment Variables:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
PORT=3000
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### 🔗 API Endpoints

#### Threat Detection
- `POST /api/detect` - Run global threat detection scan
- `GET /api/detect/active` - Get currently active threats

#### Crisis Simulation  
- `POST /api/simulate` - Run scenario simulation
- `GET /api/simulate/:id` - Get specific simulation
- `GET /api/simulate` - Get recent simulations

#### Verification System
- `POST /api/verify` - Verify a threat claim
- `GET /api/verify/:id` - Get verification results
- `GET /api/verify/threat/:threatId` - Get threat verifications

#### Voting & Validation
- `POST /api/vote` - Submit citizen vote
- `GET /api/vote/threat/:threatId` - Get threat vote counts
- `GET /api/vote/user/:userId` - Get user profile
- `GET /api/vote/leaderboard` - Get top contributors

#### Trends & Analytics
- `GET /api/trends` - Get trend analysis
- `GET /api/trends/forecast` - Get threat forecast

### 🧠 AI Integration

The system uses three Perplexity Sonar models via OpenRouter:

- **sonar-medium-online**: Deep threat research and analysis
- **sonar-small-online**: Real-time threat monitoring  
- **sonar-reasoning**: Causal simulation and verification

### 📊 Data Models

#### Threat Object
```json
{
  "id": "threat_001",
  "title": "AI-powered disinformation campaign",
  "type": "Cyber",
  "severity": 82,
  "summary": "Coordinated deepfake attacks targeting elections",
  "regions": ["North America", "Europe"],
  "sources": ["reuters.com", "bbc.com"],
  "timestamp": "2025-05-25T19:04:00Z",
  "status": "active",
  "votes": { "confirm": 45, "deny": 12, "skeptical": 8 },
  "credibilityScore": 73
}
```

#### Simulation Object
```json
{
  "id": "sim_001", 
  "scenario": "Cyberattack on power grid",
  "causalChain": ["Initial breach", "Grid failure", "Economic impact"],
  "mitigations": ["Backup systems", "Incident response"],
  "confidence": 78,
  "timestamp": "2025-05-25T19:04:00Z"
}
```

### 🔥 Firebase Collections

- `threats` - Active threat intelligence
- `simulations` - Crisis scenario analyses  
- `verifications` - Fact-checking results
- `votes` - Citizen validation data
- `users` - User profiles and XP

### 🚀 Deployment

#### Render.com (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with auto-scaling enabled

#### Manual Deployment
```bash
# Build and start
npm install --production
npm start
```

### 🔒 Security

- Rate limiting on all endpoints
- Helmet.js security headers
- CORS protection
- Input validation and sanitization
- Firebase Admin SDK for secure database access

### 🌟 Key Features

- **Real-time Analysis**: Live threat detection using AI
- **Gamified Validation**: Citizen engagement with XP and badges  
- **Causal Reasoning**: Multi-step scenario simulation
- **Counter-Analysis**: Built-in fact-checking and verification
- **Chaos Index**: Quantified global stability scoring
- **Trend Forecasting**: Predictive threat analysis

### 📈 Chaos Index Calculation

The system calculates domain-specific and global chaos indices based on:
- Threat severity and frequency
- Geographic spread
- Source credibility  
- Citizen validation scores
- Multi-domain convergence factors

### 🤝 Contributing

This backend powers a global crisis monitoring system. Contributions should focus on:
- Improved AI prompt engineering
- Enhanced threat classification
- Better forecasting algorithms  
- Optimized data structures

### 📞 Support

For deployment assistance or technical questions:
- Check the logs for detailed error messages
- Ensure all environment variables are properly set
- Verify Firebase credentials and permissions
- Test OpenRouter API connectivity

---

**🌍 Global Sentinel: Because the future needs an immune system.**

Built with the spirit of protecting humanity through technology.
