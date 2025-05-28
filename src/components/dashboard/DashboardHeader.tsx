
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  threatCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ threatCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 neon-text">Global Threat Intelligence</h1>
          <p className="text-muted-foreground">Real-time crisis monitoring and threat assessment</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-mono">LIVE</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
