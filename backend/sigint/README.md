
# 🌍 Global Sentinel SIGINT
## Signal Intelligence Web Scraper Backend

Global Sentinel SIGINT is a modular web scraper backend that continuously monitors trusted sources around the world for emerging threats and crisis signals. It processes data from RSS feeds, APIs, HTML sources, and social media, then forwards structured threat intelligence to the Global Sentinel Core backend.

---

## 🚀 Features

- **Multi-Source Scraping**: RSS feeds, REST APIs, HTML parsing, Reddit monitoring
- **Intelligent Threat Detection**: Keyword-based severity scoring and categorization
- **Automated Scheduling**: Runs every 10 minutes via cron jobs
- **Modular Architecture**: Easy to add new sources and scrapers
- **Rate Limiting**: Respectful scraping with delays between requests
- **Comprehensive Logging**: Winston-based logging with file rotation
- **Testing Endpoints**: Full Postman collection for manual testing

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js 16+ 
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file:
```env
# Core Backend URL (where threats are sent)
CORE_BACKEND_URL=https://global-sentinel-core.onrender.com

# Server Configuration  
PORT=3001
NODE_ENV=development

# Optional: Timeouts and limits
SCRAPE_TIMEOUT=15000
REQUEST_DELAY=2000
MAX_ITEMS_PER_SOURCE=25
```

### 4. Create Logs Directory
```bash
mkdir logs
```

### 5. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 🕸️ Data Sources

### RSS Feeds
- **BBC World News**: Global news and events
- **Reuters**: International wire service  
- **Al Jazeera**: Middle East and global perspectives
- **WHO Disease Outbreak News**: Health emergencies
- **CDC Health News**: US health alerts
- **Security Week**: Cybersecurity threats

### API Sources  
- **GDELT Project**: Global event database
- **USGS Earthquake Data**: Seismic activity monitoring
- **World Bank Data**: Economic indicators

### HTML Sources
- **WHO Emergency Updates**: Direct page scraping
- **CDC Emergency Preparedness**: Health alerts
- **FEMA Disasters**: Natural disaster reports

### Social Media
- **Reddit**: Multiple subreddits (worldnews, cybersecurity, climate, etc.)

---

## 🧠 Threat Intelligence Processing

Each scraped item is processed through:

1. **Content Extraction**: Title, summary, source, timestamp
2. **Category Detection**: Health, Cyber, Climate, Economic, Conflict, Natural
3. **Severity Scoring**: 0-100 based on keyword analysis
4. **Quality Filtering**: Removes low-quality or irrelevant content
5. **Standardization**: Consistent JSON format for Core backend

### Sample Output Format
```json
{
  "title": "WHO Reports New Pandemic Strain",
  "summary": "World Health Organization confirms new variant spreading across three countries",
  "type": "Health", 
  "severity": 82,
  "source": "WHO Disease Outbreak News",
  "url": "https://who.int/emergencies/...",
  "timestamp": "2025-05-25T19:03:00Z",
  "rawData": {
    "scraper": "rss",
    "feedUrl": "https://who.int/feeds/..."
  }
}
```

---

## 🔧 API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Manual Testing Endpoints
```
GET /test-scrape/rss      # Test RSS scrapers
GET /test-scrape/api      # Test API scrapers  
GET /test-scrape/html     # Test HTML scrapers
GET /test-scrape/reddit   # Test Reddit scraper
GET /test-scrape/all      # Run all scrapers
```

### Forward Test Data
```
POST /test-scrape/forward-to-detect
```
Manually test forwarding threat data to Core backend.

---

## 📬 Postman Testing

Import the Postman collection: `postman/GlobalSentinel_SIGINT.postman_collection.json`

**Variables to configure:**
- `sigint_url`: http://localhost:3001 (or your deployed URL)
- `core_url`: https://global-sentinel-core.onrender.com

**Available requests:**
- Health Check
- Test all individual scrapers
- Test complete scraping cycle
- Manual threat forwarding

---

## ⏰ Automated Scheduling

The system automatically runs:
- **Main scrape cycle**: Every 10 minutes
- **Health check**: Every hour
- **Initial startup scrape**: 30 seconds after server start

Modify schedules in `jobs/scheduledScrape.js`.

---

## 🔧 Adding New Sources

### RSS Source
Add to `config/rssSources.js`:
```javascript
{
  name: 'New Source',
  url: 'https://example.com/rss.xml', 
  category: 'Health',
  priority: 'high'
}
```

### API Source  
Add to `config/apiSources.js` and implement scraper logic in `scrapers/apiScraper.js`.

### HTML Source
Add to `config/htmlSources.js` with CSS selectors:
```javascript
{
  name: 'New Site',
  url: 'https://example.com/page',
  category: 'Cyber',
  selectors: {
    title: '.headline a',
    summary: '.description', 
    date: '.timestamp',
    link: '.headline a'
  }
}
```

---

## 📊 Logging & Monitoring

Logs are written to:
- `logs/combined.log`: All log levels
- `logs/error.log`: Errors only  
- Console: Development mode

Log format includes timestamp, level, message, and service identifier.

---

## 🚀 Deployment

### Render.com (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy as a Web Service
4. Monitor logs via Render dashboard

### Manual Deployment
1. Build the project: `npm install --production`
2. Set production environment variables
3. Start with process manager: `pm2 start server.js`
4. Configure reverse proxy (nginx) if needed

---

## 🔐 Security Considerations

- **Rate Limiting**: Built-in delays prevent overwhelming sources
- **User-Agent**: Identifies as Global Sentinel bot
- **Error Handling**: Graceful failures prevent crashes
- **Input Validation**: Sanitizes all scraped content
- **No Secrets**: No API keys required for current sources

---

## 🤝 Integration with Core Backend

SIGINT forwards all processed threats to the Core backend's `/api/detect` endpoint. Ensure:

1. Core backend is running and accessible
2. `CORE_BACKEND_URL` environment variable is set correctly  
3. Core backend accepts POST requests with threat payload format
4. Network connectivity between services

---

## 📈 Performance & Scaling

**Current capacity:**
- ~100 sources monitored
- ~500 threats processed per cycle
- 10-minute refresh interval
- <2GB memory usage

**Scaling options:**
- Increase scraping frequency
- Add more source categories
- Implement distributed scraping
- Add database caching layer

---

## 🛠️ Development

### Project Structure
```
global_sentinel_sigint/
├── config/           # Source configurations
├── scrapers/         # Scraper implementations  
├── utils/           # Utilities and formatters
├── routes/          # Express routes
├── jobs/            # Scheduled tasks
├── logs/            # Log files
└── postman/         # API testing
```

### Key Files
- `server.js`: Application entry point
- `app.js`: Express setup and middleware
- `jobs/scheduledScrape.js`: Cron job orchestration
- `utils/threatFormatter.js`: Threat processing logic
- `utils/logger.js`: Winston logging configuration

---

## 📞 Support

For technical issues or questions:
1. Check logs in `logs/` directory
2. Test individual scrapers via Postman
3. Verify Core backend connectivity
4. Review source configurations for changes

---

**Built for Global Sentinel - Earth's AI Immune System**  
*Signal Intelligence Collection Module v1.0*
