import React, { createContext, useState, useContext, useEffect } from 'react';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform, PermissionsAndroid } from 'react-native';

// ------------------- DEVICE CONFIG -------------------
export type DeviceConfig = {
  id: string; // internal ID (e.g., "esp32", "xiao")
  namePrefix: string; // name filter in scan
  serviceUUID: string; // main service UUID
  charTX: string; // notify characteristic
  charRX: string; // write characteristic
};

// Example configs – add more boards here:
export const DEVICE_CONFIGS: DeviceConfig[] = [
  {
    id: 'esp32',
    namePrefix: 'ESP32',
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    charTX: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    charRX: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  },
  {
    id: 'xiao',
    namePrefix: 'XIAO', // or 'Nicla'
    serviceUUID: '180C',
    charTX: '2a56',
    charRX: '2a57',
  },
];

// ------------------- LIVE STATE -------------------
export type LiveState = {
  sliders: number[];
  voice: number[];
  emg?: number[];
};

const INITIAL_STATE: LiveState = {
  sliders: [0, 0, 0, 0, 0],
  voice: [0, 0],
  emg: [0, 0, 0, 0],
};

// ------------------- CONTEXT TYPE -------------------
type BleContextType = {
  liveState: LiveState;
  updateLiveState: (partial: Partial<LiveState>) => void;
  connectToDevices: () => Promise<boolean>;
  sendDataToDevice: (deviceId: string, data: string) => Promise<boolean>;
};

const BleContext = createContext<BleContextType | undefined>(undefined);

// ------------------- BLE MANAGER -------------------
const bleManager = new BleManager();

// Maps to manage devices/subscriptions dynamically
let connectedDevices: Record<string, Device | null> = {};
let notifySubs: Record<string, Subscription | null> = {};

// ------------------- PROVIDER -------------------
export const BleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [liveState, setLiveState] = useState<LiveState>(INITIAL_STATE);

  const updateLiveState = (partial: Partial<LiveState>) => {
    setLiveState(prev => ({ ...prev, ...partial }));
  };

  // ------------------- PERMISSIONS -------------------
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(granted).every(
        v => v === PermissionsAndroid.RESULTS.GRANTED,
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // ------------------- DISCONNECT -------------------
  const disconnectFromDevices = async () => {
    // remove notify subs
    Object.values(notifySubs).forEach(sub => sub?.remove());
    notifySubs = {};

    // cancel all connections
    await Promise.all(
      Object.values(connectedDevices).map(async device => {
        if (device) {
          try {
            await device.cancelConnection();
          } catch {}
        }
      }),
    );

    connectedDevices = {};
  };

  // ------------------- CONNECT -------------------
  const connectToDevices = async (): Promise<boolean> => {
    const ok = await requestPermissions();
    if (!ok) return false;

    await disconnectFromDevices();

    const found: Record<string, Device | null> = {};
    DEVICE_CONFIGS.forEach(cfg => (found[cfg.id] = null));

    // scan devices
    const scanPromise = new Promise<void>(resolve => {
      const scanTimeout = setTimeout(() => {
        bleManager.stopDeviceScan();
        resolve();
      }, 10000);

      bleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error', error);
            return;
          }
          if (!device?.name) return;

          for (const cfg of DEVICE_CONFIGS) {
            if (!found[cfg.id] && device.name.startsWith(cfg.namePrefix)) {
              found[cfg.id] = device;
            }
          }

          // if all found → stop scanning early
          if (Object.values(found).every(d => d !== null)) {
            bleManager.stopDeviceScan();
            clearTimeout(scanTimeout);
            resolve();
          }
        },
      );
    });

    await scanPromise;

    // require all devices
    if (Object.values(found).some(d => d === null)) return false;

    try {
      for (const cfg of DEVICE_CONFIGS) {
        const device = await found[cfg.id]!.connect();
        await device.discoverAllServicesAndCharacteristics();
        connectedDevices[cfg.id] = device;

        notifySubs[cfg.id] = device.monitorCharacteristicForService(
          cfg.serviceUUID,
          cfg.charTX,
          (err, char) => {
            if (err) {
              console.error(`${cfg.id} notify error`, err);
              return;
            }
            if (char?.value) {
              const val = Buffer.from(char.value, 'base64').toString('utf8');
              console.log(`${cfg.id} ->`, val);
            }
          },
        );
      }

      return true;
    } catch (err) {
      console.error('Device connection failed', err);
      await disconnectFromDevices();
      return false;
    }
  };

  // ------------------- SEND DATA -------------------
  const sendDataToDevice = async (
    deviceId: string,
    data: string,
  ): Promise<boolean> => {
    const cfg = DEVICE_CONFIGS.find(c => c.id === deviceId);
    if (!cfg) {
      console.error(`Unknown device id: ${deviceId}`);
      return false;
    }

    const targetDevice = connectedDevices[deviceId];
    if (!targetDevice) return false;

    try {
      const base64 = Buffer.from(data, 'utf8').toString('base64');
      await targetDevice.writeCharacteristicWithResponseForService(
        cfg.serviceUUID,
        cfg.charRX,
        base64,
      );
      return true;
    } catch (err) {
      console.error(`${deviceId} write error`, err);
      return false;
    }
  };

  // ------------------- AUTO SEND LIVE STATE -------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connectedDevices['esp32']) return;

      const slidersCSV = liveState.sliders.map(v => Math.round(v)).join(',');
      const voiceCSV = liveState.voice.map(v => Math.round(v)).join(',');
      const emgCSV = liveState.emg?.map(v => Math.round(v)).join(',') || '';
      const payload = `${slidersCSV};${voiceCSV};${emgCSV}`;

      sendDataToDevice('esp32', payload).catch(err => console.error(err));
    }, 100);

    return () => clearInterval(interval);
  }, [liveState]);

  return (
    <BleContext.Provider
      value={{ liveState, updateLiveState, connectToDevices, sendDataToDevice }}
    >
      {children}
    </BleContext.Provider>
  );
};

// ------------------- HOOK -------------------
export const useBLE = () => {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBLE must be used inside BleProvider');
  return ctx;
};
