
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  region: string;
  confidence: number;
  sources: string[];
  trend: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

interface ThreatChartProps {
  threats: Threat[];
}

export const ThreatChart = ({ threats }: ThreatChartProps) => {
  // Generate historical data for demonstration
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      // Simulate threat level fluctuations
      const baseLevel = 45;
      const variance = Math.sin(hour * 0.5) * 15 + Math.random() * 10;
      const threatLevel = Math.max(0, Math.min(100, baseLevel + variance));
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        threatLevel: Math.round(threatLevel),
        criticalThreats: threats.filter(t => t.severity >= 80).length,
        moderateThreats: threats.filter(t => t.severity >= 60 && t.severity < 80).length,
      });
    }
    
    return data;
  };

  const data = generateHistoricalData();

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-cyan-400 neon-text">
          Threat Level Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF20" />
            <XAxis 
              dataKey="time" 
              stroke="#00FFFF60"
              fontSize={10}
              interval="preserveStartEnd"
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
              dataKey="threatLevel"
              stroke="#00FFFF"
              strokeWidth={2}
              fill="url(#threatGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-mono text-red-400">
              {threats.filter(t => t.severity >= 80).length}
            </div>
            <div className="text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-orange-400">
              {threats.filter(t => t.severity >= 60 && t.severity < 80).length}
            </div>
            <div className="text-muted-foreground">High</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
