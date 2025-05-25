
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Satellite, AlertTriangle, TrendingUp } from 'lucide-react';

export const GlobalMap = () => {
  const globalData = [
    {
      region: "Arctic Circle",
      threats: [
        { type: "Environmental", severity: 91, title: "Methane Release Acceleration" }
      ],
      coordinates: { lat: 71.0, lng: -8.0 },
      status: "critical"
    },
    {
      region: "Southern Europe",
      threats: [
        { type: "Climate/Political", severity: 87, title: "Drought Crisis Escalation" }
      ],
      coordinates: { lat: 40.0, lng: 15.0 },
      status: "critical"
    },
    {
      region: "Central Asia",
      threats: [
        { type: "Health/Security", severity: 72, title: "Pandemic Risk Emergence" }
      ],
      coordinates: { lat: 45.0, lng: 65.0 },
      status: "high"
    },
    {
      region: "Global",
      threats: [
        { type: "Cyber", severity: 69, title: "Infrastructure Vulnerability" }
      ],
      coordinates: { lat: 0, lng: 0 },
      status: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-green-400 bg-green-500/20 border-green-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Globe className="w-8 h-8 mr-3 animate-float" />
              Global Threat Visualization
            </h2>
            <p className="text-muted-foreground">
              Real-time global risk monitoring and satellite intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
            <Badge variant="outline" className="bg-green-500/20 text-green-400">
              LIVE
            </Badge>
          </div>
        </div>
      </div>

      {/* World Map Visualization */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Interactive Global Risk Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-950/80 rounded-lg p-8 border border-cyan-500/30 min-h-[400px]">
            {/* Simplified world map background */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Simplified world continents */}
                <path
                  d="M150,100 Q200,80 250,100 Q300,90 350,110 L400,120 Q450,130 500,140 Q550,135 600,145 L650,150 Q700,155 750,160 L750,250 Q700,240 650,235 L600,230 Q550,225 500,220 Q450,215 400,210 L350,205 Q300,200 250,195 Q200,190 150,185 Z"
                  fill="currentColor"
                  className="text-cyan-400/30"
                />
                <path
                  d="M100,200 Q120,180 140,200 Q160,190 180,210 Q200,200 220,220 L240,230 Q260,240 280,250 Q300,245 320,255 L340,260 Q360,265 380,270 L380,320 Q360,315 340,310 L320,305 Q300,300 280,295 Q260,290 240,285 L220,280 Q200,275 180,270 Q160,265 140,260 Q120,255 100,250 Z"
                  fill="currentColor"
                  className="text-cyan-400/30"
                />
              </svg>
            </div>

            {/* Threat indicators on map */}
            {globalData.map((region, index) => (
              <div
                key={region.region}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                  transition-all duration-300 hover:scale-110
                `}
                style={{
                  left: `${50 + (region.coordinates.lng / 180) * 40}%`,
                  top: `${50 - (region.coordinates.lat / 90) * 30}%`
                }}
              >
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${getStatusColor(region.status)}
                  ${region.status === 'critical' ? 'animate-threat-pulse' : 'animate-pulse'}
                `}>
                  <AlertTriangle className="w-3 h-3" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 min-w-[200px]">
                    <div className="font-semibold text-cyan-400 text-sm">
                      {region.region}
                    </div>
                    {region.threats.map((threat, tIndex) => (
                      <div key={tIndex} className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          {threat.type}
                        </div>
                        <div className="text-sm">{threat.title}</div>
                        <div className="text-lg font-mono text-red-400">
                          Severity: {threat.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 rounded-lg p-4 border border-cyan-500/30">
              <div className="text-sm font-semibold text-cyan-400 mb-2">
                Threat Levels
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span>Critical (80+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>High (60-79)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Moderate (40-59)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Low (0-39)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {globalData.map((region, index) => (
          <Card key={region.region} className={`${getStatusColor(region.status)} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{region.region}</span>
                <Badge variant="outline" className={getStatusColor(region.status)}>
                  {region.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {region.threats.map((threat, tIndex) => (
                <div key={tIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{threat.title}</span>
                    <span className="text-lg font-mono">{threat.severity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {threat.type}
                    </Badge>
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
