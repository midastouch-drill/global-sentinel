
import { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'moderate';
  timestamp: Date;
}

export const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate real-time alerts
    const newAlert: Alert = {
      id: 'alert-1',
      title: 'CRITICAL: Arctic Methane Levels Rising',
      message: 'Satellite monitoring shows 15% increase in methane emissions from Arctic permafrost in the last 48 hours.',
      severity: 'critical',
      timestamp: new Date()
    };

    setAlerts([newAlert]);

    // Simulate additional alerts
    const timer = setTimeout(() => {
      const alert2: Alert = {
        id: 'alert-2',
        title: 'High Priority: Southern Europe Water Crisis',
        message: 'AI models indicate 78% probability of severe water shortages affecting 12M people within 6 months.',
        severity: 'high',
        timestamp: new Date()
      };
      setAlerts(prev => [...prev, alert2]);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default: return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            ${getSeverityColor(alert.severity)}
            border-2 rounded-lg p-4 backdrop-blur-sm
            ${alert.severity === 'critical' ? 'animate-threat-pulse' : 'animate-pulse-glow'}
            shadow-2xl
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dismissAlert(alert.id)}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <h4 className="font-semibold mb-1">{alert.title}</h4>
          <p className="text-sm opacity-90 leading-relaxed">{alert.message}</p>
          
          <div className="mt-3 text-xs opacity-70">
            {alert.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};
