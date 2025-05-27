
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Globe, 
  Brain, 
  Activity, 
  AlertTriangle,
  Filter,
  Calendar,
  BarChart3,
  Map,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { useThreats, useTrends } from '@/hooks/useThreats';

const RealTimeAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [threatTypeFilter, setThreatTypeFilter] = useState('all');
  
  const { data: threatsResponse } = useThreats();
  const { data: trendsData } = useTrends();
  
  const threats = threatsResponse?.threats || [];

  // Process threat data for analytics
  const threatsByType = threats.reduce((acc: any, threat: any) => {
    acc[threat.type] = (acc[threat.type] || 0) + 1;
    return acc;
  }, {});

  const threatsByRegion = threats.reduce((acc: any, threat: any) => {
    const regions = threat.regions || ['Unknown'];
    regions.forEach((region: string) => {
      acc[region] = (acc[region] || 0) + 1;
    });
    return acc;
  }, {});

  const severityDistribution = threats.reduce((acc: any, threat: any) => {
    if (threat.severity >= 80) acc.critical++;
    else if (threat.severity >= 60) acc.high++;
    else if (threat.severity >= 40) acc.medium++;
    else acc.low++;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  // Generate trend data for the last 24 hours
  const generateTrendData = () => {
    const hours = 24;
    const data = [];
    const now = new Date();
    
    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourThreats = threats.filter((threat: any) => {
        const threatTime = new Date(threat.timestamp);
        return threatTime.getHours() === time.getHours() &&
               threatTime.getDate() === time.getDate();
      });
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        threats: hourThreats.length,
        critical: hourThreats.filter((t: any) => t.severity >= 80).length,
        severity: hourThreats.reduce((sum: number, t: any) => sum + t.severity, 0) / (hourThreats.length || 1)
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  const pieData = [
    { name: 'Critical', value: severityDistribution.critical, color: '#ef4444' },
    { name: 'High', value: severityDistribution.high, color: '#f97316' },
    { name: 'Medium', value: severityDistribution.medium, color: '#eab308' },
    { name: 'Low', value: severityDistribution.low, color: '#22c55e' }
  ];

  const typeData = Object.entries(threatsByType).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count as number / threats.length) * 100)
  }));

  const globalRiskIndex = Math.round(
    threats.reduce((sum: number, threat: any) => sum + threat.severity, 0) / threats.length || 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 animate-pulse-glow" />
              Real-Time Threat Analytics
            </h2>
            <p className="text-muted-foreground">
              AI-powered intelligence dashboard with live threat metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
              className="cyber-button"
            >
              24H
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
              className="cyber-button"
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
              className="cyber-button"
            >
              30D
            </Button>
          </div>
        </div>

        {/* Global Risk Index */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="cyber-card p-4 border-2 border-cyan-500/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-mono text-cyan-400 mb-1">
                  {globalRiskIndex}
                </div>
                <div className="text-sm text-muted-foreground">Global Risk Index</div>
              </div>
              <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <Progress value={globalRiskIndex} className="mt-2" />
          </div>
          
          <div className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-mono text-red-400 mb-1">
                  {severityDistribution.critical}
                </div>
                <div className="text-sm text-muted-foreground">Critical Threats</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 animate-threat-pulse" />
            </div>
          </div>
          
          <div className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-mono text-cyan-400 mb-1">
                  {threats.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Threats</div>
              </div>
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="cyber-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-mono text-green-400 mb-1">
                  {Object.keys(threatsByRegion).length}
                </div>
                <div className="text-sm text-muted-foreground">Affected Regions</div>
              </div>
              <Map className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Threat Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Threat Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Threat Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threat Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Threats by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(threatsByRegion)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([region, count]) => (
                    <div key={region} className="flex items-center justify-between">
                      <span className="text-sm">{region}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={((count as number) / threats.length) * 100} 
                          className="w-20 h-2"
                        />
                        <Badge variant="outline" className="cyber-badge">
                          {count}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="cyber-card border-2 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Brain className="w-6 h-6 mr-2 animate-pulse" />
              AI Intelligence Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold text-purple-400 mb-2">Trend Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {threats.length > 10 ? 
                    "High threat activity detected. Recommend increased monitoring of cyber and health sectors." :
                    "Threat levels within normal parameters. Continue standard monitoring protocols."
                  }
                </p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">Recommended Actions</h4>
                <p className="text-sm text-muted-foreground">
                  {severityDistribution.critical > 5 ?
                    "Multiple critical threats detected. Initiate emergency response protocols." :
                    "Monitor emerging patterns in detected threat categories."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RealTimeAnalytics;
