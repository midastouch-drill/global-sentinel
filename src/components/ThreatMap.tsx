
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Satellite, AlertTriangle, TrendingUp, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  region?: string;
  location?: { lat: number; lng: number };
  timestamp: string;
  source: string;
}

interface ThreatMapProps {
  threats: Threat[];
}

export const ThreatMap = ({ threats }: ThreatMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Group threats by region for clustering
  const regionData = threats.reduce((acc, threat) => {
    const region = threat.region || 'Global';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(threat);
    return acc;
  }, {} as Record<string, Threat[]>);

  const getRegionCoordinates = (region: string) => {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'Arctic Circle': { lat: 71, lng: -8 },
      'Southern Europe': { lat: 40, lng: 15 },
      'Central Asia': { lat: 45, lng: 65 },
      'North America': { lat: 45, lng: -100 },
      'Africa': { lat: 0, lng: 20 },
      'Global': { lat: 0, lng: 0 },
      'Eastern Europe': { lat: 50, lng: 30 },
      'Middle East': { lat: 30, lng: 45 },
      'Southeast Asia': { lat: 10, lng: 105 },
    };
    return coordinates[region] || { lat: 0, lng: 0 };
  };

  const getMaxSeverity = (threats: Threat[]) => {
    return Math.max(...threats.map(t => t.severity));
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'from-red-500 to-red-700';
    if (severity >= 60) return 'from-orange-500 to-orange-700';
    if (severity >= 40) return 'from-yellow-500 to-yellow-700';
    return 'from-green-500 to-green-700';
  };

  const getSeverityRing = (severity: number) => {
    if (severity >= 80) return 'ring-red-500';
    if (severity >= 60) return 'ring-orange-500';
    if (severity >= 40) return 'ring-yellow-500';
    return 'ring-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 neon-text flex items-center">
              <Globe className="w-8 h-8 mr-3 animate-float" />
              Global Threat Intelligence Map
            </h2>
            <p className="text-muted-foreground">
              Real-time planetary threat monitoring with satellite intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
            <Badge variant="outline" className="bg-green-500/20 text-green-400 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
          <div className="text-center">
            <div className="text-2xl font-mono text-yellow-400">
              {threats.filter(t => t.severity >= 40 && t.severity < 60).length}
            </div>
            <div className="text-muted-foreground">Moderate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-cyan-400">
              {Object.keys(regionData).length}
            </div>
            <div className="text-muted-foreground">Regions</div>
          </div>
        </div>
      </motion.div>

      {/* Interactive World Map */}
      <Card className="cyber-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Interactive Threat Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg border border-cyan-500/30 min-h-[500px] overflow-hidden"
          >
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-20 grid-rows-10 w-full h-full">
                {Array.from({ length: 200 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="border border-cyan-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{
                      duration: 3,
                      delay: i * 0.01,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Simplified world map SVG */}
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full opacity-30"
            >
              {/* World continents - simplified paths */}
              <motion.path
                d="M150,100 Q200,80 250,100 Q300,90 350,110 L400,120 Q450,130 500,140 Q550,135 600,145 L650,150 Q700,155 750,160 L750,250 Q700,240 650,235 L600,230 Q550,225 500,220 Q450,215 400,210 L350,205 Q300,200 250,195 Q200,190 150,185 Z"
                fill="currentColor"
                className="text-cyan-400/20"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.path
                d="M100,200 Q120,180 140,200 Q160,190 180,210 Q200,200 220,220 L240,230 Q260,240 280,250 Q300,245 320,255 L340,260 Q360,265 380,270 L380,320 Q360,315 340,310 L320,305 Q300,300 280,295 Q260,290 240,285 L220,280 Q200,275 180,270 Q160,265 140,260 Q120,255 100,250 Z"
                fill="currentColor"
                className="text-cyan-400/20"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity }}
              />
            </svg>

            {/* Threat markers */}
            <AnimatePresence>
              {Object.entries(regionData).map(([region, regionThreats]) => {
                const coords = getRegionCoordinates(region);
                const maxSeverity = getMaxSeverity(regionThreats);
                const position = {
                  left: `${50 + (coords.lng / 180) * 35}%`,
                  top: `${50 - (coords.lat / 90) * 30}%`
                };

                return (
                  <motion.div
                    key={region}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={position}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.2 }}
                    onHoverStart={() => setHoveredRegion(region)}
                    onHoverEnd={() => setHoveredRegion(null)}
                    onClick={() => setSelectedThreat(regionThreats[0])}
                  >
                    {/* Pulsing ring for critical threats */}
                    {maxSeverity >= 80 && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.8, 0.2, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        style={{ width: '40px', height: '40px', marginLeft: '-20px', marginTop: '-20px' }}
                      />
                    )}

                    {/* Main threat marker */}
                    <div
                      className={`
                        w-8 h-8 rounded-full border-2 flex items-center justify-center
                        bg-gradient-to-br ${getSeverityColor(maxSeverity)}
                        ${getSeverityRing(maxSeverity)}
                        shadow-lg backdrop-blur-sm
                        ${maxSeverity >= 80 ? 'animate-threat-pulse' : 'animate-pulse'}
                      `}
                    >
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>

                    {/* Threat count badge */}
                    {regionThreats.length > 1 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {regionThreats.length}
                      </div>
                    )}

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {hoveredRegion === region && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20"
                        >
                          <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 min-w-[250px] backdrop-blur-sm">
                            <div className="font-semibold text-cyan-400 text-sm mb-2">
                              {region}
                            </div>
                            <div className="space-y-1">
                              {regionThreats.slice(0, 3).map((threat, index) => (
                                <div key={index} className="text-xs">
                                  <div className="text-white font-medium">{threat.title}</div>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {threat.type}
                                    </Badge>
                                    <span className={`font-mono ${
                                      threat.severity >= 80 ? 'text-red-400' :
                                      threat.severity >= 60 ? 'text-orange-400' :
                                      threat.severity >= 40 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {threat.severity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {regionThreats.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{regionThreats.length - 3} more threats
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 rounded-lg p-4 border border-cyan-500/30 backdrop-blur-sm">
              <div className="text-sm font-semibold text-cyan-400 mb-2">
                Threat Severity Levels
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-700 rounded-full animate-pulse" />
                  <span>Critical (80+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full" />
                  <span>High (60-79)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full" />
                  <span>Moderate (40-59)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-700 rounded-full" />
                  <span>Low (0-39)</span>
                </div>
              </div>
            </div>

            {/* Real-time indicator */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/80 rounded-lg p-2 border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-mono">LIVE</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
