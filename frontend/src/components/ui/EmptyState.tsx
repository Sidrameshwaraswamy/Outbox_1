import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FileText size={32} />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm mt-1 max-w-xs">{description}</p>
    </div>
  );
};
