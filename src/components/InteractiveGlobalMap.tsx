
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  AlertTriangle, 
  Eye, 
  Filter,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreatMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  severity: number;
  type: string;
  description: string;
  region: string;
}

interface InteractiveGlobalMapProps {
  threats?: any[];
}

export const InteractiveGlobalMap = ({ threats = [] }: InteractiveGlobalMapProps) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [threatMarkers, setThreatMarkers] = useState<ThreatMarker[]>([]);

  // Mock threat locations for demonstration
  const mockThreats: ThreatMarker[] = [
    {
      id: '1',
      lat: 40.7128,
      lng: -74.0060,
      title: 'Cyber Infrastructure Threat',
      severity: 85,
      type: 'Cyber',
      description: 'AI-powered attacks targeting financial systems',
      region: 'North America'
    },
    {
      id: '2', 
      lat: 51.5074,
      lng: -0.1278,
      title: 'Economic Instability Warning',
      severity: 72,
      type: 'Economic',
      description: 'Supply chain disruptions affecting trade',
      region: 'Europe'
    },
    {
      id: '3',
      lat: 35.6762,
      lng: 139.6503,
      title: 'Climate Crisis Escalation',
      severity: 78,
      type: 'Climate',
      description: 'Rising sea levels threatening infrastructure',
      region: 'Asia Pacific'
    },
    {
      id: '4',
      lat: -33.8688,
      lng: 151.2093,
      title: 'Resource Conflict Risk',
      severity: 68,
      type: 'Geopolitical',
      description: 'Water scarcity driving regional tensions',
      region: 'Oceania'
    },
    {
      id: '5',
      lat: -23.5505,
      lng: -46.6333,
      title: 'Health System Stress',
      severity: 75,
      type: 'Health',
      description: 'Pandemic preparedness gaps identified',
      region: 'South America'
    }
  ];

  useEffect(() => {
    // Convert threats prop to threat markers or use mock data
    if (threats && threats.length > 0) {
      const markers = threats.slice(0, 10).map((threat, index) => ({
        id: threat.id || `threat-${index}`,
        lat: 40 + (Math.random() - 0.5) * 60, // Random lat between -30 and 70
        lng: (Math.random() - 0.5) * 360, // Random lng between -180 and 180
        title: threat.title || 'Unknown Threat',
        severity: threat.severity || 50,
        type: threat.type || 'Unknown',
        description: threat.summary || 'No description available',
        region: threat.regions?.[0] || 'Global'
      }));
      setThreatMarkers(markers);
    } else {
      setThreatMarkers(mockThreats);
    }
  }, [threats]);

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400 bg-red-500/20 border-red-500/50';
    if (severity >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
  };

  const filteredThreats = filterType === 'all' 
    ? threatMarkers 
    : threatMarkers.filter(threat => threat.type.toLowerCase() === filterType.toLowerCase());

  const threatTypes = ['all', ...Array.from(new Set(threatMarkers.map(t => t.type)))];

  return (
    <Card className="cyber-card h-full">
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* World Map Container */}
        <div className="relative w-full h-96 bg-slate-900 rounded-lg border border-cyan-500/30 overflow-hidden">
          {/* SVG World Map Representation */}
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-full"
            style={{ background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)' }}
          >
            {/* Simplified continents outline */}
            <path 
              d="M100,200 Q200,150 300,180 Q400,160 500,190 Q600,170 700,200 Q650,250 550,240 Q450,260 350,240 Q250,250 100,200"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              className="opacity-50"
            />
            
            {/* Grid lines */}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 100}
                y1={0}
                x2={i * 100}
                y2={400}
                stroke="#1e293b"
                strokeWidth="1"
                className="opacity-30"
              />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * 100}
                x2={800}
                y2={i * 100}
                stroke="#1e293b"
                strokeWidth="1"
                className="opacity-30"
              />
            ))}
            
            {/* Threat Markers */}
            {filteredThreats.map((threat, index) => {
              const x = ((threat.lng + 180) / 360) * 800;
              const y = ((90 - threat.lat) / 180) * 400;
              
              return (
                <motion.g
                  key={threat.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedThreat(threat)}
                >
                  {/* Pulse animation */}
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill={threat.severity >= 80 ? '#ef4444' : threat.severity >= 60 ? '#f97316' : '#eab308'}
                    className="opacity-30 animate-ping"
                  />
                  
                  {/* Main marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={threat.severity >= 80 ? '#ef4444' : threat.severity >= 60 ? '#f97316' : '#eab308'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Severity indicator */}
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#06b6d4"
                    className="font-mono"
                  >
                    {threat.severity}
                  </text>
                </motion.g>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
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
            </div>
          </div>
          
          {/* Stats */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
            <div className="text-xs text-cyan-400 font-medium mb-2">Global Status</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Threats:</span>
                <span className="text-cyan-400 font-mono">{filteredThreats.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Critical:</span>
                <span className="text-red-400 font-mono">
                  {filteredThreats.filter(t => t.severity >= 80).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Regions:</span>
                <span className="text-cyan-400 font-mono">
                  {new Set(filteredThreats.map(t => t.region)).size}
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
                  <div className={`text-2xl font-mono ${getSeverityColor(selectedThreat.severity).split(' ')[0]}`}>
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
                  <div className="text-xs text-muted-foreground">Location</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {selectedThreat.description}
              </p>
              
              <div className="flex space-x-2">
                <Button size="sm" className="cyber-button">
                  <Eye className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
                <Button size="sm" variant="outline" className="cyber-button">
                  <TrendingUp className="w-4 h-4 mr-2" />
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
