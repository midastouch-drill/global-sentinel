
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
  isLoading?: boolean;
  hasData?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, isLoading, hasData }) => {
  if (hasData) {
    return (
      <Card className="cyber-card border-yellow-500/50">
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-400 mb-2">Intelligence System Online</h3>
            <p className="text-muted-foreground mb-4">Connected to threat intelligence network</p>
            <Button onClick={onRetry} className="cyber-button" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card">
      <CardContent className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-400 mb-2">Intelligence System Error</h3>
          <p className="text-muted-foreground mb-4">Failed to connect to threat intelligence network</p>
          <Button onClick={onRetry} className="cyber-button" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
