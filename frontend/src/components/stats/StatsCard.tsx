import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
  tone?: 'blue' | 'green' | 'orange' | 'red';
}

const toneStyles = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  detail,
  tone = 'blue',
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`${toneStyles[tone]} p-3 rounded-lg text-gray-700`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{detail}</p>
        </div>
      </div>
    </div>
  );
};
