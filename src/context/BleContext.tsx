import React, { createContext, useState, useContext } from 'react';

type BleData = {
  [deviceName: string]: string[];
};

type BleContextType = {
  liveData: BleData;
  addData: (device: string, value: string) => void;
};

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [liveData, setLiveData] = useState<BleData>({});

  const addData = (device: string, value: string) => {
    setLiveData(prev => ({
      ...prev,
      [device]: [...(prev[device] || []), value],
    }));
  };

  return (
    <BleContext.Provider value={{ liveData, addData }}>
      {children}
    </BleContext.Provider>
  );
};

export const useBLE = () => {
  const context = useContext(BleContext);
  if (!context) throw new Error('useBle must be used inside BleProvider');
  return context;
};
