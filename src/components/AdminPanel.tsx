import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSigintScraping } from '../hooks/useSigint';
import { Settings, Zap, Database, Activity, Globe, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminPanel = () => {
  const [systemStatus, setSystemStatus] = useState({
    coreServer: 'online',
    sigintServer: 'online',
    database: 'healthy',
    lastUpdate: new Date().toISOString()
  });

  const {
    scrapeRss,
    scrapeApi,
    scrapeHtml,
    scrapeReddit,
    isLoading
  } = useSigintScraping();

  const scraperControls = [
    {
      name: 'RSS Feeds',
      description: 'BBC, Reuters, Al Jazeera news feeds',
      icon: Globe,
      action: () => scrapeRss(),
      sources: ['BBC World', 'Reuters', 'Al Jazeera', 'Associated Press']
    },
    {
      name: 'API Sources',
      description: 'GDELT, World Bank, WHO APIs',
      icon: Database,
      action: () => scrapeApi(),
      sources: ['GDELT Events', 'World Bank Data', 'WHO Disease Outbreaks']
    },
    {
      name: 'HTML Scrapers',
      description: 'Government and institutional websites',
      icon: Activity,
      action: () => scrapeHtml(),
      sources: ['CDC Emergency', 'ECDC Threats', 'FEMA Alerts']
    },
    {
      name: 'Reddit Monitoring',
      description: 'Social media trend analysis',
      icon: Brain,
      action: () => scrapeReddit(),
      sources: ['r/worldnews', 'r/collapse', 'r/geopolitics', 'r/cybersecurity']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-400 bg-green-500/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'offline':
      case 'error':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Settings className="w-8 h-8 mr-3 animate-pulse-glow" />
              Global Sentinel Admin Control
            </h2>
            <p className="text-muted-foreground">
              System administration and intelligence collection controls
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
              DEVELOPMENT MODE
            </Badge>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="scrapers" className="space-y-6">
        <TabsList className="cyber-card p-1">
          <TabsTrigger value="scrapers" className="cyber-button">
            SIGINT Controls
          </TabsTrigger>
          <TabsTrigger value="system" className="cyber-button">
            System Status
          </TabsTrigger>
          <TabsTrigger value="settings" className="cyber-button">
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scrapers" className="space-y-6">
          {/* Scraper Controls */}
          <div className="grid gap-6 md:grid-cols-2">
            {scraperControls.map((scraper, index) => {
              const Icon = scraper.icon;
              return (
                <motion.div
                  key={scraper.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cyber-card hover:border-cyan-500/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        {scraper.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {scraper.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-cyan-400">
                          Active Sources:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {scraper.sources.map((source) => (
                            <Badge 
                              key={source}
                              variant="outline" 
                              className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={scraper.action}
                        disabled={isLoading}
                        className="w-full cyber-button"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {isLoading ? 'Processing...' : `Trigger ${scraper.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Bulk Actions */}
          <Card className="cyber-card border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    scrapeRss();
                    scrapeApi();
                  }}
                  disabled={isLoading}
                  className="cyber-button"
                >
                  Trigger All News Sources
                </Button>
                <Button
                  onClick={() => {
                    scrapeHtml();
                    scrapeReddit();
                  }}
                  disabled={isLoading}
                  className="cyber-button"
                >
                  Trigger All Analysis Sources
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bulk operations will sequentially trigger multiple scrapers. Allow 30-60 seconds for completion.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Status */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-lg">Core Server</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(systemStatus.coreServer)}>
                    {systemStatus.coreServer.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    localhost:5000
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-lg">SIGINT Server</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(systemStatus.sigintServer)}>
                    {systemStatus.sigintServer.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    localhost:4000
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 text-lg">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(systemStatus.database)}>
                    {systemStatus.database.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Firestore
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">API Endpoints Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { method: 'GET', endpoint: '/threats', description: 'Fetch all threats' },
                  { method: 'POST', endpoint: '/detect', description: 'AI threat detection' },
                  { method: 'POST', endpoint: '/simulate', description: 'Scenario simulation' },
                  { method: 'POST', endpoint: '/verify', description: 'Threat verification' },
                  { method: 'POST', endpoint: '/vote', description: 'Community voting' },
                  { method: 'GET', endpoint: '/trends', description: 'Threat analytics' },
                ].map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className={
                        api.method === 'GET' ? 'text-green-400' : 'text-orange-400'
                      }>
                        {api.method}
                      </Badge>
                      <code className="text-sm text-cyan-400">{api.endpoint}</code>
                      <span className="text-sm text-muted-foreground">{api.description}</span>
                    </div>
                    <Badge className="text-green-400 bg-green-500/20">
                      ACTIVE
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Development Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-cyan-400">Core Backend:</div>
                  <div className="text-muted-foreground">http://localhost:5000</div>
                </div>
                <div>
                  <div className="font-medium text-cyan-400">SIGINT Backend:</div>
                  <div className="text-muted-foreground">http://localhost:4000</div>
                </div>
                <div>
                  <div className="font-medium text-cyan-400">Auto-refresh:</div>
                  <div className="text-muted-foreground">30 seconds</div>
                </div>
                <div>
                  <div className="font-medium text-cyan-400">Cache Duration:</div>
                  <div className="text-muted-foreground">10 seconds</div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-sm font-medium text-yellow-400 mb-1">
                  Development Mode Active
                </div>
                <div className="text-xs text-muted-foreground">
                  This admin panel is only available in development. Configure production deployment settings before going live.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
