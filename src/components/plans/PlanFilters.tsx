import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

interface PlanFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  selectedSort: string;
}

const PlanFilters: React.FC<PlanFiltersProps> = ({
  searchQuery,
  onSearchChange,
  onSortChange,
  selectedSort
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="w-full sm:w-96">
        <Input
          type="text"
          placeholder="Search your plans..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-5 h-5 text-neutral-400" />}
          fullWidth
        />
      </div>
      
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-neutral-400" />
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="border-2 border-neutral-300 rounded-md p-2 focus:border-primary-500 focus:outline-none text-sm"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title">By Title</option>
          <option value="location">By Location</option>
        </select>
      </div>
    </div>
  );
};

export default PlanFilters;