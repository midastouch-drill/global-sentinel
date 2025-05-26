
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Globe } from 'lucide-react';
import { useTrends } from '../hooks/useThreats';
import { motion } from 'framer-motion';

export const TrendsDashboard = () => {
  const { data: trendsData, isLoading } = useTrends();

  // Mock data for demonstration
  const mockTrends = {
    chaosIndex: {
      timeline: [
        { time: '00:00', overall: 45, cyber: 35, climate: 50, health: 40, economic: 48 },
        { time: '04:00', overall: 52, cyber: 42, climate: 55, health: 45, economic: 58 },
        { time: '08:00', overall: 38, cyber: 28, climate: 45, health: 35, economic: 42 },
        { time: '12:00', overall: 67, cyber: 72, climate: 60, health: 65, economic: 70 },
        { time: '16:00', overall: 74, cyber: 80, climate: 65, health: 70, economic: 78 },
        { time: '20:00', overall: 59, cyber: 65, climate: 52, health: 58, economic: 62 },
        { time: '24:00', overall: 43, cyber: 38, climate: 47, health: 42, economic: 45 },
      ],
      regions: [
        { name: 'North America', value: 65, threats: 12 },
        { name: 'Europe', value: 72, threats: 18 },
        { name: 'Asia-Pacific', value: 58, threats: 15 },
        { name: 'Middle East', value: 84, threats: 22 },
        { name: 'Africa', value: 61, threats: 9 },
        { name: 'South America', value: 45, threats: 7 },
      ],
      categories: [
        { name: 'Cyber', value: 28, color: '#FF6B6B' },
        { name: 'Climate', value: 22, color: '#4ECDC4' },
        { name: 'Health', value: 18, color: '#45B7D1' },
        { name: 'Economic', value: 16, color: '#FFA07A' },
        { name: 'Conflict', value: 12, color: '#98D8C8' },
        { name: 'Other', value: 4, color: '#FADDE1' },
      ]
    }
  };

  const data = trendsData || mockTrends;

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FADDE1'];

  return (
    <div className="space-y-6">
      {/* Trends Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 animate-pulse-glow" />
              Global Threat Analytics Dashboard
            </h2>
            <p className="text-muted-foreground">
              Real-time threat intelligence trends and chaos index monitoring
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-mono text-cyan-400">
                {data.chaosIndex.timeline[data.chaosIndex.timeline.length - 1]?.overall || 0}
              </div>
              <div className="text-sm text-muted-foreground">Current Chaos Index</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { 
            label: 'Global Threat Level', 
            value: data.chaosIndex.timeline[data.chaosIndex.timeline.length - 1]?.overall || 0,
            change: '+12%',
            trend: 'up',
            color: 'text-red-400'
          },
          { 
            label: 'Active Regions', 
            value: data.chaosIndex.regions.length,
            change: '+2',
            trend: 'up',
            color: 'text-orange-400'
          },
          { 
            label: 'Cyber Threats', 
            value: data.chaosIndex.timeline[data.chaosIndex.timeline.length - 1]?.cyber || 0,
            change: '+25%',
            trend: 'up',
            color: 'text-red-400'
          },
          { 
            label: 'Climate Risks', 
            value: data.chaosIndex.timeline[data.chaosIndex.timeline.length - 1]?.climate || 0,
            change: '-5%',
            trend: 'down',
            color: 'text-green-400'
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="cyber-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center text-sm ${
                      metric.trend === 'up' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                24-Hour Threat Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.chaosIndex.timeline}>
                  <defs>
                    <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#00FFFF60"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="#00FFFF60"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 20, 40, 0.9)',
                      border: '1px solid #00FFFF30',
                      borderRadius: '8px',
                      color: '#00FFFF'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="overall"
                    stroke="#00FFFF"
                    strokeWidth={2}
                    fill="url(#overallGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="cyber"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threat Categories Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Threat Distribution by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.chaosIndex.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.chaosIndex.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 20, 40, 0.9)',
                      border: '1px solid #00FFFF30',
                      borderRadius: '8px',
                      color: '#00FFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Regional Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-cyan-400">Regional Threat Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chaosIndex.regions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
                <XAxis 
                  dataKey="name" 
                  stroke="#00FFFF60"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#00FFFF60" fontSize={10} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 20, 40, 0.9)',
                    border: '1px solid #00FFFF30',
                    borderRadius: '8px',
                    color: '#00FFFF'
                  }}
                />
                <Bar dataKey="value" fill="#00FFFF" />
                <Bar dataKey="threats" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
              {data.chaosIndex.regions.map((region, index) => (
                <div key={region.name} className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-lg font-mono text-cyan-400">{region.value}</div>
                  <div className="text-xs text-muted-foreground">{region.name}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {region.threats} threats
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
