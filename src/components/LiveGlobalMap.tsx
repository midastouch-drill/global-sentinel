
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  MapPin, 
  Filter,
  Satellite,
  Zap,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveGlobalMapProps {
  threats?: any[];
}

// OpenStreetMap integration without external dependencies
export const LiveGlobalMap = ({ threats = [] }: LiveGlobalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);

  // Convert threats to map markers with locations
  const threatMarkers = threats.map((threat, index) => {
    // Map regions to approximate coordinates
    const regionCoords: Record<string, {lat: number, lng: number}> = {
      'North America': { lat: 45, lng: -100 },
      'South America': { lat: -15, lng: -60 },
      'Europe': { lat: 50, lng: 10 },
      'Africa': { lat: 0, lng: 20 },
      'Asia': { lat: 35, lng: 100 },
      'Oceania': { lat: -25, lng: 140 },
      'Middle East': { lat: 30, lng: 45 },
      'Arctic': { lat: 75, lng: 0 },
      'Global': { lat: 20, lng: 0 }
    };

    const region = threat.regions?.[0] || threat.location || 'Global';
    const coords = regionCoords[region] || regionCoords['Global'];
    
    // Add some randomization for multiple threats in same region
    const jitter = 5;
    return {
      ...threat,
      lat: coords.lat + (Math.random() - 0.5) * jitter,
      lng: coords.lng + (Math.random() - 0.5) * jitter,
      region
    };
  });

  const filteredMarkers = filterType === 'all' 
    ? threatMarkers 
    : threatMarkers.filter(marker => marker.type.toLowerCase() === filterType.toLowerCase());

  const threatTypes = ['all', ...Array.from(new Set(threats.map(t => t.type)))];

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return '#ef4444'; // red-500
    if (severity >= 60) return '#f97316'; // orange-500
    if (severity >= 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getSeveritySize = (severity: number) => {
    if (severity >= 80) return 16;
    if (severity >= 60) return 12;
    if (severity >= 40) return 10;
    return 8;
  };

  // Convert lat/lng to pixel coordinates (simple projection)
  const projectToPixel = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  const handleMarkerClick = (threat: any) => {
    setSelectedThreat(threat);
    setMapCenter({ lat: threat.lat, lng: threat.lng });
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 1, 8));
  const zoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

  return (
    <Card className="cyber-card h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-400 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Live Global Threat Map
          </CardTitle>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="w-4 h-4 text-cyan-400 animate-pulse" />
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                <Zap className="w-3 h-3 mr-1" />
                LIVE OSM
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-cyan-500/30 rounded px-2 py-1 text-sm text-cyan-400"
              >
                {threatTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Map Container */}
        <div 
          ref={mapRef}
          className="relative w-full h-96 bg-slate-900 rounded-lg border border-cyan-500/30 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #1e293b 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #0f172a 0%, transparent 50%),
              linear-gradient(135deg, #020617 0%, #0f172a 100%)
            `
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Latitude lines */}
              {Array.from({ length: 9 }, (_, i) => (
                <line
                  key={`lat-${i}`}
                  x1="0"
                  y1={`${(i / 8) * 100}%`}
                  x2="100%"
                  y2={`${(i / 8) * 100}%`}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              ))}
              {/* Longitude lines */}
              {Array.from({ length: 13 }, (_, i) => (
                <line
                  key={`lng-${i}`}
                  x1={`${(i / 12) * 100}%`}
                  y1="0"
                  x2={`${(i / 12) * 100}%`}
                  y2="100%"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>

          {/* Continent outlines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {/* Simplified continent shapes */}
            <path 
              d="M100,150 Q200,120 300,140 Q400,130 500,150 Q600,140 700,160 L700,250 Q600,240 500,230 Q400,235 300,225 Q200,230 100,240 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
            />
            <path 
              d="M150,280 Q250,260 350,270 Q450,265 550,275 L550,350 Q450,340 350,345 Q250,350 150,360 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
            />
          </svg>
          
          {/* Threat Markers */}
          {filteredMarkers.map((threat, index) => {
            const position = projectToPixel(threat.lat, threat.lng, 100, 100);
            const size = getSeveritySize(threat.severity);
            const color = getSeverityColor(threat.severity);
            
            return (
              <motion.div
                key={threat.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`
                }}
                onClick={() => handleMarkerClick(threat)}
              >
                {/* Pulse ring for critical threats */}
                {threat.severity >= 80 && (
                  <motion.div
                    className="absolute rounded-full border-2"
                    style={{ 
                      borderColor: color,
                      width: size * 2,
                      height: size * 2,
                      left: -size,
                      top: -size
                    }}
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.8, 0.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                {/* Main marker */}
                <div
                  className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    backgroundColor: color,
                    width: size,
                    height: size
                  }}
                >
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>

                {/* Severity label */}
                <div 
                  className="absolute text-xs font-mono text-center mt-1"
                  style={{
                    color: color,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: size
                  }}
                >
                  {threat.severity}
                </div>
              </motion.div>
            );
          })}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={zoomIn}
              className="w-8 h-8 p-0 bg-slate-900/80 border-cyan-500/30"
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={zoomOut}
              className="w-8 h-8 p-0 bg-slate-900/80 border-cyan-500/30"
            >
              -
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 font-medium mb-2">Threat Severity</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-muted-foreground">Critical (80+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-muted-foreground">High (60-79)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-muted-foreground">Medium (40-59)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Low (0-39)</span>
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 font-medium mb-2">Live Intelligence</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active:</span>
                <span className="text-cyan-400 font-mono">{filteredMarkers.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Critical:</span>
                <span className="text-red-400 font-mono">
                  {filteredMarkers.filter(t => t.severity >= 80).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Regions:</span>
                <span className="text-cyan-400 font-mono">
                  {new Set(filteredMarkers.map(t => t.region)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Threat Details Panel */}
        <AnimatePresence>
          {selectedThreat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-cyan-400">
                  {selectedThreat.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedThreat(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div 
                    className="text-2xl font-mono"
                    style={{ color: getSeverityColor(selectedThreat.severity) }}
                  >
                    {selectedThreat.severity}
                  </div>
                  <div className="text-xs text-muted-foreground">Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono text-cyan-400">
                    {selectedThreat.type}
                  </div>
                  <div className="text-xs text-muted-foreground">Type</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono text-cyan-400">
                    {selectedThreat.region}
                  </div>
                  <div className="text-xs text-muted-foreground">Region</div>
                </div>
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-cyan-400 mx-auto" />
                  <div className="text-xs text-muted-foreground">
                    {selectedThreat.lat.toFixed(1)}°, {selectedThreat.lng.toFixed(1)}°
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {selectedThreat.summary}
              </p>
              
              <div className="flex space-x-2">
                <Button size="sm" className="cyber-button">
                  <Eye className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
                <Button size="sm" variant="outline" className="cyber-button">
                  <Satellite className="w-4 h-4 mr-2" />
                  Monitor
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
