import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSimulate } from '@/hooks/useThreats';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  threat?: any;
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, threat }) => {
  const [scenario, setScenario] = useState(threat?.title || '');
  const simulateMutation = useSimulate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate({
      scenario: scenario
    });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simulate Threat Scenario</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the scenario to simulate a threat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Input
              type="text"
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Cyber Attack on Financial Infrastructure"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Simulate</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SimulationModal;
