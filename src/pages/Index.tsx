
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EnhancedThreatDashboard } from '@/components/EnhancedThreatDashboard';
import { CrisisSimulator } from '@/components/CrisisSimulator';
import { InteractiveGlobalMap } from '@/components/InteractiveGlobalMap';
import { CitizenValidator } from '@/components/CitizenValidator';
import { TrendsDashboard } from '@/components/TrendsDashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { AlertSystem } from '@/components/AlertSystem';
import { MatrixBackground } from '@/components/MatrixBackground';
import RealTimeAnalytics from '@/components/RealTimeAnalytics';
import SimulationLab from '@/components/SimulationLab';
import { useThreats } from '../hooks/useThreats';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chaosIndex, setChaosIndex] = useState(0);
  
  const { data: threatsResponse } = useThreats();
  const threats = threatsResponse?.threats || [];

  useEffect(() => {
    // Calculate real-time chaos index based on active threats
    if (threats.length > 0) {
      const avgSeverity = threats.reduce((sum: number, threat: any) => sum + threat.severity, 0) / threats.length;
      const criticalCount = threats.filter((t: any) => t.severity >= 80).length;
      const weightedIndex = avgSeverity + (criticalCount * 5); // Boost for critical threats
      setChaosIndex(Math.min(100, weightedIndex));
    } else {
      setChaosIndex(0);
    }
  }, [threats]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedThreatDashboard />;
      case 'simulator':
        return <SimulationLab />;
      case 'map':
        return <InteractiveGlobalMap threats={threats} />;
      case 'validator':
        return <CitizenValidator />;
      case 'trends':
        return <RealTimeAnalytics />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <EnhancedThreatDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <MatrixBackground />
      
      {/* Enhanced scan line effect */}
      <div className="scan-line" />
      
      <div className="relative z-10">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          chaosIndex={chaosIndex}
          threatCount={threats.length}
        />
        
        <AlertSystem />
        
        <main className="container mx-auto px-4 py-6">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
