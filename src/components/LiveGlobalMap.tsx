
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, AlertTriangle, Satellite, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
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
              OpenStreetMap Global Threat Monitor
            </h2>
            <p className="text-muted-foreground">
              Real-time planetary threat monitoring with OpenStreetMap integration
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

      {/* Interactive OpenStreetMap Style World Map */}
      <Card className="cyber-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Interactive OpenStreetMap Threat Visualization
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={resetView}>
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="relative bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg border border-cyan-500/30 min-h-[600px] overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 70%)
              `,
              backgroundSize: '50px 50px, 50px 50px, 100% 100%',
            }}
          >
            {/* OpenStreetMap style world outline with zoom and pan */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <svg
                viewBox="0 0 1000 500"
                className="absolute inset-0 w-full h-full opacity-60"
              >
                {/* Detailed OpenStreetMap style continents */}
                {/* North America */}
                <motion.path
                  d="M50,120 Q80,100 120,110 Q160,105 200,115 L250,125 Q300,130 350,140 Q380,145 400,150 L420,155 Q440,160 460,170 L480,180 Q500,190 520,200 L540,210 Q560,220 580,230 L600,240 Q620,250 640,240 L660,230 Q680,220 700,210 L720,200 Q740,190 760,180 L780,170 Q800,160 820,150 L840,140 Q860,130 880,120 L900,110 Q920,100 940,90 L940,280 Q920,270 900,260 L880,250 Q860,240 840,230 L820,220 Q800,210 780,200 L760,190 Q740,180 720,170 L700,160 Q680,150 660,140 L640,130 Q620,120 600,110 L580,100 Q560,90 540,80 L520,70 Q500,60 480,50 L460,40 Q440,30 420,35 L400,40 Q380,45 350,50 Q300,55 250,60 L200,65 Q160,70 120,75 Q80,80 50,85 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
                
                {/* Europe */}
                <motion.path
                  d="M450,80 Q470,70 490,75 Q510,80 530,85 L550,90 Q570,95 590,100 Q610,105 630,110 L650,115 Q670,120 690,125 L710,130 Q730,135 750,140 L770,145 Q790,150 810,155 L830,160 Q850,165 870,170 L870,220 Q850,215 830,210 L810,205 Q790,200 770,195 L750,190 Q730,185 710,180 L690,175 Q670,170 650,165 L630,160 Q610,155 590,150 Q570,145 550,140 L530,135 Q510,130 490,125 Q470,120 450,115 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, delay: 1, repeat: Infinity }}
                />
                
                {/* Africa */}
                <motion.path
                  d="M480,200 Q500,190 520,195 Q540,200 560,205 L580,210 Q600,215 620,220 Q640,225 660,230 L680,235 Q700,240 720,245 L740,250 Q760,255 780,260 L800,265 Q820,270 840,275 L860,280 Q880,285 900,290 L900,400 Q880,395 860,390 L840,385 Q820,380 800,375 L780,370 Q760,365 740,360 L720,355 Q700,350 680,345 L660,340 Q640,335 620,330 Q600,325 580,320 L560,315 Q540,310 520,305 Q500,300 480,295 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, delay: 2, repeat: Infinity }}
                />

                {/* Asia */}
                <motion.path
                  d="M600,60 Q630,50 660,55 Q690,60 720,65 L750,70 Q780,75 810,80 Q840,85 870,90 L900,95 Q930,100 960,105 L990,110 Q1020,115 1050,120 L1050,250 Q1020,245 990,240 L960,235 Q930,230 900,225 L870,220 Q840,215 810,210 Q780,205 750,200 L720,195 Q690,190 660,185 Q630,180 600,175 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, delay: 3, repeat: Infinity }}
                />

                {/* South America */}
                <motion.path
                  d="M200,280 Q220,270 240,275 Q260,280 280,285 L300,290 Q320,295 340,300 Q360,305 380,310 L400,315 Q420,320 440,325 L460,330 Q480,335 500,340 L520,345 Q540,350 560,355 L580,360 Q600,365 620,370 L620,450 Q600,445 580,440 L560,435 Q540,430 520,425 L500,420 Q480,415 460,410 L440,405 Q420,400 400,395 L380,390 Q360,385 340,380 Q320,375 300,370 L280,365 Q260,360 240,355 Q220,350 200,345 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, delay: 4, repeat: Infinity }}
                />

                {/* Australia/Oceania */}
                <motion.path
                  d="M800,350 Q820,340 840,345 Q860,350 880,355 L900,360 Q920,365 940,370 L960,375 Q980,380 1000,385 L1000,420 Q980,415 960,410 L940,405 Q920,400 900,395 L880,390 Q860,385 840,380 Q820,375 800,370 Z"
                  fill="currentColor"
                  className="text-blue-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, delay: 5, repeat: Infinity }}
                />
              </svg>

              {/* Threat markers with zoom-aware positioning */}
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
            </div>

            {/* Map controls and legend */}
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
              <div className="mt-3 pt-2 border-t border-cyan-500/20">
                <div className="text-xs text-cyan-400">Zoom: {zoom.toFixed(1)}x</div>
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
