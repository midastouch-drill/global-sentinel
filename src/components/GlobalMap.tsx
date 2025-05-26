
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

interface Threat {
  id: string;
  title: string;
  severity: number;
  type: string;
  location?: {
    lat: number;
    lng: number;
    country?: string;
  };
}

interface GlobalMapProps {
  threats: Threat[];
}

export const GlobalMap = ({ threats }: GlobalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2);
    mapInstanceRef.current = map;

    // Add dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add threat markers
    threats.forEach((threat) => {
      if (threat.location) {
        const color = threat.severity >= 80 ? '#ef4444' : 
                     threat.severity >= 60 ? '#f97316' : '#22d3ee';
        
        const marker = L.circleMarker([threat.location.lat, threat.location.lng], {
          radius: Math.max(5, threat.severity / 10),
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6
        });

        marker.bindPopup(`
          <div class="text-sm">
            <div class="font-semibold text-cyan-400">${threat.title}</div>
            <div class="text-muted-foreground">${threat.type}</div>
            <div class="text-orange-400">Severity: ${threat.severity}%</div>
          </div>
        `);

        marker.addTo(map);
      }
    });
  }, [threats]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cyber-card p-4"
    >
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 neon-text">
        Global Threat Distribution
      </h3>
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg overflow-hidden border border-cyan-500/30"
        style={{ background: '#0f172a' }}
      />
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical (80+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High (60-79)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span>Moderate (&lt;60)</span>
          </div>
        </div>
        <div>{threats.length} active threats</div>
      </div>
    </motion.div>
  );
};
