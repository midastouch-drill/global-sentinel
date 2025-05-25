
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ThreatDashboard } from '@/components/ThreatDashboard';
import { CrisisSimulator } from '@/components/CrisisSimulator';
import { GlobalMap } from '@/components/GlobalMap';
import { CitizenValidator } from '@/components/CitizenValidator';
import { AlertSystem } from '@/components/AlertSystem';
import { MatrixBackground } from '@/components/MatrixBackground';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chaosIndex, setChaosIndex] = useState(0);

  useEffect(() => {
    // Simulate real-time chaos index updates
    const interval = setInterval(() => {
      setChaosIndex(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ThreatDashboard />;
      case 'simulator':
        return <CrisisSimulator />;
      case 'map':
        return <GlobalMap />;
      case 'validator':
        return <CitizenValidator />;
      default:
        return <ThreatDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <MatrixBackground />
      
      {/* Scan line effect */}
      <div className="scan-line" />
      
      <div className="relative z-10">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          chaosIndex={chaosIndex}
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
