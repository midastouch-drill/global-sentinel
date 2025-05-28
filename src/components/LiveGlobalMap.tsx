
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, AlertTriangle, Satellite } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  summary: string;
  regions?: string[];
  timestamp: string;
}

interface LiveGlobalMapProps {
  threats: Threat[];
}

export const LiveGlobalMap = ({ threats }: LiveGlobalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredThreat, setHoveredThreat] = useState<Threat | null>(null);

  // Group threats by region
  const regionData = threats.reduce((acc, threat) => {
    const regions = threat.regions || ['Global'];
    regions.forEach(region => {
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(threat);
    });
    return acc;
  }, {} as Record<string, Threat[]>);

  const getRegionCoordinates = (region: string) => {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'North America': { lat: 45, lng: -100 },
      'South America': { lat: -15, lng: -60 },
      'Europe': { lat: 50, lng: 10 },
      'Africa': { lat: 0, lng: 20 },
      'Asia': { lat: 30, lng: 100 },
      'Southeast Asia': { lat: 10, lng: 105 },
      'Middle East': { lat: 30, lng: 45 },
      'Oceania': { lat: -25, lng: 140 },
      'Global': { lat: 0, lng: 0 },
      'Southern Europe': { lat: 40, lng: 15 },
      'Eastern Europe': { lat: 50, lng: 30 },
      'Central Asia': { lat: 45, lng: 65 },
      'Arctic Circle': { lat: 71, lng: -8 },
      'Mediterranean': { lat: 35, lng: 18 }
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
    if (severity >= 80) return 'ring-red-500 border-red-500';
    if (severity >= 60) return 'ring-orange-500 border-orange-500';
    if (severity >= 40) return 'ring-yellow-500 border-yellow-500';
    return 'ring-green-500 border-green-500';
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
              Live Global Threat Map
            </h2>
            <p className="text-muted-foreground">
              Real-time planetary threat monitoring with satellite intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
            <Badge variant="outline" className="bg-green-500/20 text-green-400 animate-pulse">
              LIVE OSM
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

      {/* Interactive World Map using OpenStreetMap styling */}
      <Card className="cyber-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Interactive Threat Visualization (OpenStreetMap)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg border border-cyan-500/30 min-h-[600px] overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23334155' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
            }}
          >
            {/* OpenStreetMap-style world outline */}
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full opacity-40"
            >
              {/* Continents - simplified OpenStreetMap style paths */}
              <motion.path
                d="M150,150 Q200,130 250,150 Q300,140 350,160 L400,170 Q450,180 500,190 Q550,185 600,195 L650,200 Q700,205 750,210 L750,300 Q700,290 650,285 L600,280 Q550,275 500,270 Q450,265 400,260 L350,255 Q300,250 250,245 Q200,240 150,235 Z"
                fill="currentColor"
                className="text-cyan-400/30"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.path
                d="M100,250 Q120,230 140,250 Q160,240 180,260 Q200,250 220,270 L240,280 Q260,290 280,300 Q300,295 320,305 L340,310 Q360,315 380,320 L380,370 Q360,365 340,360 L320,355 Q300,350 280,345 Q260,340 240,335 L220,330 Q200,325 180,320 Q160,315 140,310 Q120,305 100,300 Z"
                fill="currentColor"
                className="text-cyan-400/30"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity }}
              />
              {/* Africa */}
              <motion.path
                d="M450,250 Q470,240 490,260 Q510,250 530,270 L550,280 Q570,290 590,300 Q610,295 630,305 L650,310 Q670,315 690,320 L690,420 Q670,415 650,410 L630,405 Q610,400 590,395 Q570,390 550,385 L530,380 Q510,375 490,370 Q470,365 450,360 Z"
                fill="currentColor"
                className="text-cyan-400/30"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, delay: 2, repeat: Infinity }}
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
                    onHoverStart={() => setSelectedRegion(region)}
                    onHoverEnd={() => setSelectedRegion(null)}
                  >
                    {/* Pulsing ring for critical threats */}
                    {maxSeverity >= 80 && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500"
                        animate={{
                          scale: [1, 2.5, 1],
                          opacity: [0.8, 0.2, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        style={{ width: '50px', height: '50px', marginLeft: '-25px', marginTop: '-25px' }}
                      />
                    )}

                    {/* Main threat marker */}
                    <div
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center
                        bg-gradient-to-br ${getSeverityColor(maxSeverity)}
                        ${getSeverityRing(maxSeverity)}
                        shadow-lg backdrop-blur-sm
                        ${maxSeverity >= 80 ? 'animate-threat-pulse' : 'animate-pulse'}
                      `}
                    >
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>

                    {/* Threat count badge */}
                    {regionThreats.length > 1 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {regionThreats.length}
                      </div>
                    )}

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {selectedRegion === region && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20"
                        >
                          <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-4 min-w-[280px] backdrop-blur-sm">
                            <div className="font-semibold text-cyan-400 text-sm mb-3">
                              {region} ({regionThreats.length} threats)
                            </div>
                            <div className="space-y-2">
                              {regionThreats.slice(0, 3).map((threat, index) => (
                                <div 
                                  key={index} 
                                  className="text-xs p-2 bg-slate-800/50 rounded"
                                  onMouseEnter={() => setHoveredThreat(threat)}
                                  onMouseLeave={() => setHoveredThreat(null)}
                                >
                                  <div className="text-white font-medium mb-1">{threat.title}</div>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {threat.type}
                                    </Badge>
                                    <span className={`font-mono text-xs ${
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
                                <div className="text-xs text-muted-foreground text-center">
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

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg p-4 border border-cyan-500/30 backdrop-blur-sm">
              <div className="text-sm font-semibold text-cyan-400 mb-3">
                OpenStreetMap Threat Overlay
              </div>
              <div className="space-y-2 text-xs">
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
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/80 rounded-lg p-3 border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-mono">LIVE OSM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Details Panel */}
      <AnimatePresence>
        {hoveredThreat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="cyber-card p-6"
          >
            <h3 className="text-lg font-bold text-cyan-400 mb-2">
              {hoveredThreat.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hoveredThreat.summary}
            </p>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{hoveredThreat.type}</Badge>
              <span className="text-sm">
                Severity: <span className="font-mono text-orange-400">{hoveredThreat.severity}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(hoveredThreat.timestamp).toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
