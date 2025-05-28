
import React from 'react';
import { motion } from 'framer-motion';

interface ThreatStatsProps {
  criticalThreats: number;
  highThreats: number;
  totalThreats: number;
  avgSeverity: number;
}

const ThreatStats: React.FC<ThreatStatsProps> = ({
  criticalThreats,
  highThreats,
  totalThreats,
  avgSeverity
}) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-400';
    if (severity >= 60) return 'text-orange-400';
    if (severity >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
        <div className="text-2xl font-mono text-red-400">{criticalThreats}</div>
        <div className="text-sm text-muted-foreground">Critical</div>
      </div>
      <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-orange-500/30">
        <div className="text-2xl font-mono text-orange-400">{highThreats}</div>
        <div className="text-sm text-muted-foreground">High Risk</div>
      </div>
      <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
        <div className="text-2xl font-mono text-cyan-400">{totalThreats}</div>
        <div className="text-sm text-muted-foreground">Total Active</div>
      </div>
      <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30">
        <div className={`text-2xl font-mono ${getSeverityColor(avgSeverity)}`}>{avgSeverity}</div>
        <div className="text-sm text-muted-foreground">Avg Severity</div>
      </div>
    </div>
  );
};

export default ThreatStats;
