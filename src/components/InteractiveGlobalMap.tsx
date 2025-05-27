
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Satellite, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  Zap, 
  Filter,
  RotateCcw,
  Layers,
  Search,
  Target
} from 'lucide-react';

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

interface InteractiveGlobalMapProps {
  threats: Threat[];
}

export const InteractiveGlobalMap = ({ threats }: InteractiveGlobalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState('dark');
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Enhanced threat data with realistic global coordinates
  const enhancedThreats = threats.map(threat => ({
    ...threat,
    location: threat.location || getLocationForRegion(threat.region || 'Global')
  }));

  function getLocationForRegion(region: string) {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'Arctic Circle': { lat: 71, lng: -8 },
      'Southern Europe': { lat: 40, lng: 15 },
      'Central Asia': { lat: 45, lng: 65 },
      'North America': { lat: 45, lng: -100 },
      'Africa': { lat: 0, lng: 20 },
      'Global': { lat: 20, lng: 0 },
      'Eastern Europe': { lat: 50, lng: 30 },
      'Middle East': { lat: 30, lng: 45 },
      'Southeast Asia': { lat: 10, lng: 105 },
      'South America': { lat: -15, lng: -60 },
      'Pacific': { lat: 0, lng: -170 },
      'Atlantic': { lat: 30, lng: -40 },
      'Mediterranean': { lat: 36, lng: 15 },
      'Scandinavia': { lat: 62, lng: 15 },
      'Balkans': { lat: 44, lng: 20 }
    };
    return coordinates[region] || { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 };
  }

  // Filter threats based on selected type
  const filteredThreats = filterType === 'all' 
    ? enhancedThreats 
    : enhancedThreats.filter(threat => threat.type.toLowerCase() === filterType.toLowerCase());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with enhanced options
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });
    
    mapInstanceRef.current = map;

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Map style configuration
    const mapStyles = {
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png'
    };

    const currentStyle = mapStyles[mapStyle as keyof typeof mapStyles] || mapStyles.dark;

    L.tileLayer(currentStyle, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add threat markers with enhanced visualization
    filteredThreats.forEach((threat) => {
      if (threat.location) {
        const severity = threat.severity;
        const color = severity >= 80 ? '#ef4444' : 
                     severity >= 60 ? '#f97316' : 
                     severity >= 40 ? '#eab308' : '#22d3ee';

        // Create pulsing marker for critical threats
        const markerOptions: L.CircleMarkerOptions = {
          radius: Math.max(8, severity / 8),
          fillColor: color,
          color: color,
          weight: 3,
          opacity: 0.9,
          fillOpacity: 0.7,
          className: severity >= 80 ? 'threat-marker-critical' : 'threat-marker-normal'
        };

        const marker = L.circleMarker([threat.location.lat, threat.location.lng], markerOptions);

        // Enhanced popup with interactive content
        const popupContent = `
          <div class="threat-popup">
            <div class="threat-popup-header">
              <h3 class="text-sm font-semibold text-cyan-400 mb-1">${threat.title}</h3>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs bg-${severity >= 80 ? 'red' : severity >= 60 ? 'orange' : 'yellow'}-500/20 text-${severity >= 80 ? 'red' : severity >= 60 ? 'orange' : 'yellow'}-400 px-2 py-1 rounded">${threat.type}</span>
                <span class="text-xs font-mono text-white">${severity}%</span>
              </div>
            </div>
            <div class="threat-popup-content">
              <p class="text-xs text-gray-300 mb-2">${threat.summary}</p>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">Source: ${threat.source}</span>
                <button onclick="window.threatMapHandler.viewDetails('${threat.id}')" class="text-cyan-400 hover:text-cyan-300">View Details →</button>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'threat-popup-container',
          maxWidth: 300,
          closeButton: true
        });

        // Add click handler for marker
        marker.on('click', () => {
          setSelectedThreat(threat);
        });

        // Add hover effects
        marker.on('mouseover', () => {
          marker.setStyle({ radius: markerOptions.radius! * 1.2 });
        });

        marker.on('mouseout', () => {
          marker.setStyle({ radius: markerOptions.radius! });
        });

        marker.addTo(map);

        // Add connection lines for related threats
        if (animationEnabled && severity >= 70) {
          const relatedThreats = filteredThreats.filter(t => 
            t.id !== threat.id && 
            t.type === threat.type && 
            t.location &&
            getDistance(threat.location, t.location) < 3000 // Within 3000km
          );

          relatedThreats.forEach(related => {
            if (related.location) {
              const line = L.polyline([
                [threat.location!.lat, threat.location!.lng],
                [related.location.lat, related.location.lng]
              ], {
                color: color,
                weight: 2,
                opacity: 0.4,
                dashArray: '5, 10'
              }).addTo(map);
            }
          });
        }
      }
    });

    // Global threat handler for popup interactions
    (window as any).threatMapHandler = {
      viewDetails: (threatId: string) => {
        const threat = threats.find(t => t.id === threatId);
        if (threat) {
          setSelectedThreat(threat);
        }
      }
    };

  }, [filteredThreats, animationEnabled]);

  // Calculate distance between two coordinates
  function getDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const threatTypes = ['all', ...Array.from(new Set(threats.map(t => t.type)))];

  const resetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([20, 0], 2);
    }
  };

  const focusOnThreat = (threat: Threat) => {
    if (mapInstanceRef.current && threat.location) {
      mapInstanceRef.current.setView([threat.location.lat, threat.location.lng], 6);
      setSelectedThreat(threat);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Map Header */}
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

        {/* Enhanced Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-cyan-500/30 rounded px-3 py-1 text-sm"
            >
              {threatTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <select 
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="bg-slate-900 border border-cyan-500/30 rounded px-3 py-1 text-sm"
            >
              <option value="dark">Dark Mode</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>

          <Button
            onClick={() => setAnimationEnabled(!animationEnabled)}
            variant="outline"
            size="sm"
            className="cyber-button"
          >
            <Zap className="w-4 h-4 mr-1" />
            {animationEnabled ? 'Disable' : 'Enable'} Animation
          </Button>

          <Button
            onClick={resetMap}
            variant="outline"
            size="sm"
            className="cyber-button"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset View
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-mono text-red-400">
              {filteredThreats.filter(t => t.severity >= 80).length}
            </div>
            <div className="text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-orange-400">
              {filteredThreats.filter(t => t.severity >= 60 && t.severity < 80).length}
            </div>
            <div className="text-muted-foreground">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-yellow-400">
              {filteredThreats.filter(t => t.severity >= 40 && t.severity < 60).length}
            </div>
            <div className="text-muted-foreground">Moderate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-green-400">
              {filteredThreats.filter(t => t.severity < 40).length}
            </div>
            <div className="text-muted-foreground">Low</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono text-cyan-400">
              {filteredThreats.length}
            </div>
            <div className="text-muted-foreground">Total</div>
          </div>
        </div>
      </motion.div>

      {/* Main Map Container */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="cyber-card overflow-hidden">
            <CardContent className="p-0">
              <div 
                ref={mapRef}
                className="w-full h-[600px] relative"
                style={{ background: '#0f172a' }}
              />
              
              {/* Map Overlays */}
              <div className="absolute top-4 left-4 z-[1000] space-y-2">
                <div className="bg-slate-900/80 rounded-lg p-3 border border-cyan-500/30 backdrop-blur-sm">
                  <div className="text-sm font-semibold text-cyan-400 mb-2">
                    Threat Severity Levels
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

              <div className="absolute bottom-4 right-4 z-[1000]">
                <div className="bg-slate-900/80 rounded-lg p-2 border border-green-500/30 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-mono">LIVE DATA</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threat List Sidebar */}
        <div className="space-y-4">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 text-sm">Active Threats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                {filteredThreats.slice(0, 10).map((threat) => (
                  <motion.div
                    key={threat.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-slate-900/50 rounded-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-500/50 transition-colors"
                    onClick={() => focusOnThreat(threat)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white line-clamp-2">
                        {threat.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          threat.severity >= 80 ? 'text-red-400 border-red-500/30' :
                          threat.severity >= 60 ? 'text-orange-400 border-orange-500/30' :
                          threat.severity >= 40 ? 'text-yellow-400 border-yellow-500/30' :
                          'text-green-400 border-green-500/30'
                        }`}
                      >
                        {threat.severity}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-400">{threat.type}</span>
                      <span className="text-gray-400">{threat.region}</span>
                    </div>
                    <Progress value={threat.severity} className="mt-2 h-1" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Threat Detail Modal */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedThreat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-lg border border-cyan-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-cyan-400">{selectedThreat.title}</h3>
                <Button
                  onClick={() => setSelectedThreat(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                    {selectedThreat.type}
                  </Badge>
                  <span className={`font-mono text-lg ${
                    selectedThreat.severity >= 80 ? 'text-red-400' :
                    selectedThreat.severity >= 60 ? 'text-orange-400' :
                    selectedThreat.severity >= 40 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {selectedThreat.severity}% Severity
                  </span>
                </div>
                
                <p className="text-gray-300">{selectedThreat.summary}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Region:</span>
                    <span className="ml-2 text-white">{selectedThreat.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Source:</span>
                    <span className="ml-2 text-white">{selectedThreat.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="ml-2 text-white">
                      {new Date(selectedThreat.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="ml-2 text-white font-mono">
                      {selectedThreat.location?.lat.toFixed(2)}, {selectedThreat.location?.lng.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button className="cyber-button" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Threat
                  </Button>
                  <Button variant="outline" className="cyber-button" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Trends
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
