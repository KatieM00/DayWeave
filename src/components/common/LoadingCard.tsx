import React from 'react';
import Card from './Card';

const LoadingCard: React.FC = () => {
  return (
    <Card className="p-4">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-neutral-200 h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LoadingCard;