
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ThreatMapProps {
  threats?: any[];
}

export const OpenStreetMap: React.FC<ThreatMapProps> = ({ threats = [] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Generate random coordinates for threats that don't have location data
  const generateThreatMarkers = (threatsData: any[]) => {
    return threatsData.map((threat, index) => {
      // Generate realistic coordinates for major world regions
      const regions = [
        { name: 'North America', lat: 40 + Math.random() * 20, lng: -100 + Math.random() * 40 },
        { name: 'Europe', lat: 50 + Math.random() * 15, lng: 0 + Math.random() * 40 },
        { name: 'Asia', lat: 30 + Math.random() * 30, lng: 80 + Math.random() * 80 },
        { name: 'Africa', lat: -10 + Math.random() * 40, lng: 15 + Math.random() * 40 },
        { name: 'South America', lat: -20 + Math.random() * 30, lng: -70 + Math.random() * 30 }
      ];
      
      const randomRegion = regions[index % regions.length];
      
      return {
        ...threat,
        coordinates: threat.coordinates || {
          lat: randomRegion.lat,
          lng: randomRegion.lng
        }
      };
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with OpenStreetMap tiles
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tile layer with dark theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      className: 'map-tiles'
    }).addTo(map);

    // Create marker layer group
    const markersLayer = L.layerGroup().addTo(map);
    
    mapInstanceRef.current = map;
    markersRef.current = markersLayer;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !threats.length) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Generate threat markers with coordinates
    const threatMarkers = generateThreatMarkers(threats);
    
    // Filter threats based on selected type
    const filteredThreats = filterType === 'all' 
      ? threatMarkers 
      : threatMarkers.filter(threat => 
          threat.type?.toLowerCase().includes(filterType.toLowerCase())
        );

    // Add markers for each threat
    filteredThreats.forEach((threat) => {
      if (threat.coordinates) {
        const { lat, lng } = threat.coordinates;
        
        // Determine marker color based on severity
        const getMarkerColor = (severity: number) => {
          if (severity >= 80) return '#ef4444'; // red
          if (severity >= 60) return '#f97316'; // orange
          if (severity >= 40) return '#eab308'; // yellow
          return '#22d3ee'; // cyan
        };

        // Create custom icon
        const markerHtml = `
          <div style="
            background-color: ${getMarkerColor(threat.severity)};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${threat.severity}
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-threat-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Create marker with popup
        const marker = L.marker([lat, lng], { icon: customIcon });
        
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="font-semibold text-cyan-400 mb-1">${threat.title}</div>
            <div class="text-sm text-gray-600 mb-2">${threat.type || 'Unknown Type'}</div>
            <div class="text-sm text-gray-700 mb-2">${threat.summary || 'No description available'}</div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Severity:</span>
              <span class="text-sm font-bold" style="color: ${getMarkerColor(threat.severity)}">${threat.severity}%</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.addLayer(marker);
      }
    });
  }, [threats, filterType]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const threatTypes = ['all', 'cyber', 'health', 'climate', 'economic', 'geopolitical'];
  const filteredCount = filterType === 'all' ? threats.length : 
    threats.filter(t => t.type?.toLowerCase().includes(filterType.toLowerCase())).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="cyber-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Global Threat Map
            </CardTitle>
            
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
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="cyber-button"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Map Container */}
          <div className="relative w-full h-96 rounded-lg overflow-hidden border border-cyan-500/30">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
              <div className="text-xs text-cyan-400 font-medium mb-2">Threat Levels</div>
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
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-xs text-muted-foreground">Low (&lt;40)</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
              <div className="text-xs text-cyan-400 font-medium mb-2">Statistics</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Showing:</span>
                  <span className="text-cyan-400 font-mono">{filteredCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="text-cyan-400 font-mono">{threats.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Critical:</span>
                  <span className="text-red-400 font-mono">
                    {threats.filter(t => t.severity >= 80).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="cyber-badge">
                OpenStreetMap
              </Badge>
              <span className="text-muted-foreground">
                Showing {filteredCount} of {threats.length} threats
              </span>
            </div>
            <div className="text-muted-foreground">
              Filter: {filterType === 'all' ? 'All Types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Custom CSS for map styling */}
      <style>{`
        .custom-threat-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
          border-radius: 8px !important;
        }
        
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
        }
        
        .map-tiles {
          filter: hue-rotate(180deg) invert(1) contrast(1.2) brightness(0.7);
        }
      `}</style>
    </motion.div>
  );
};
