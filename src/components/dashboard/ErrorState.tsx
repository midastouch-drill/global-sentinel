
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <Card className="cyber-card">
      <CardContent className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-400 mb-2">Intelligence System Error</h3>
          <p className="text-muted-foreground mb-4">Failed to connect to threat intelligence network</p>
          <Button onClick={onRetry} className="cyber-button">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
