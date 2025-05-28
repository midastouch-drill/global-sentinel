
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface DashboardControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  threatTypes: string[];
  onRefresh: () => void;
  isLoading: boolean;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  threatTypes,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search threats, regions, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-500"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900/50 border border-cyan-500/30 rounded px-3 py-2 text-sm text-cyan-400"
        >
          {threatTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <Button 
        onClick={onRefresh} 
        disabled={isLoading}
        className="cyber-button"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default DashboardControls;
