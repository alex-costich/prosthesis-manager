import React from 'react';

interface DeviceCardProps {
  name: string;
  value: string;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ name, value }) => {
  return (
    <div className="bg-white p-4 rounded shadow border">
      <h2 className="text-lg font-bold mb-1">{name}</h2>
      <p className="text-sm text-gray-700">Data: {value || 'No data yet'}</p>
    </div>
  );
};

export default DeviceCard;
