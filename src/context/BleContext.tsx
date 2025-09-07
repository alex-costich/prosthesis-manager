import React, { createContext, useState, useContext, useEffect } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform, PermissionsAndroid } from 'react-native';

export const SERVICE_UUID_ESP32 = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const CHAR_UUID_ESP32_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
export const CHAR_UUID_ESP32_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

export type LiveState = {
  sliders: number[]; // 5 sliders
  voice: number[]; // 2 voice values, for example
};

const INITIAL_STATE: LiveState = {
  sliders: [0, 0, 0, 0, 0],
  voice: [0, 0],
};

type BleContextType = {
  liveState: LiveState;
  updateLiveState: (partial: Partial<LiveState>) => void;
  connectToESP32: () => Promise<boolean>;
};

const BleContext = createContext<BleContextType | undefined>(undefined);

const bleManager = new BleManager();
let esp32Device: Device | null = null;

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [liveState, setLiveState] = useState<LiveState>(INITIAL_STATE);

  const updateLiveState = (partial: Partial<LiveState>) => {
    setLiveState(prev => ({ ...prev, ...partial }));
  };

  // Android BLE permissions
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

  const connectToESP32 = async (): Promise<boolean> => {
    const ok = await requestPermissions();
    if (!ok) return false;

    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        console.warn('ESP32 not found in scan');
        resolve(false);
      }, 10000);

      bleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        async (error, device) => {
          if (error) {
            console.error(error);
            resolve(false);
            return;
          }
          if (!device?.name) return;

          if (device.name.startsWith('ESP32')) {
            clearTimeout(timeout);
            bleManager.stopDeviceScan();

            try {
              const d = await device.connect();
              await d.discoverAllServicesAndCharacteristics();
              esp32Device = d;

              // optional: monitor notifications
              esp32Device.monitorCharacteristicForService(
                SERVICE_UUID_ESP32,
                CHAR_UUID_ESP32_TX,
                (err, char) => {
                  if (err) console.error(err);
                  if (char?.value) {
                    const val = Buffer.from(char.value, 'base64').toString(
                      'utf8',
                    );
                    console.log('ESP32 ->', val);
                  }
                },
              );

              console.log('ESP32 connected');
              resolve(true);
            } catch (e) {
              console.error('ESP32 connection failed', e);
              resolve(false);
            }
          }
        },
      );
    });
  };

  // Continuous sending loop: send liveState every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (!esp32Device) return;

      const slidersCSV = liveState.sliders.map(v => Math.round(v)).join(',');
      const voiceCSV = liveState.voice.map(v => Math.round(v)).join(',');
      const payload = `${slidersCSV};${voiceCSV}`; // ESP32 can split by ';'

      const base64Value = Buffer.from(payload, 'utf8').toString('base64');

      esp32Device
        .writeCharacteristicWithResponseForService(
          SERVICE_UUID_ESP32,
          CHAR_UUID_ESP32_RX,
          base64Value,
        )
        .catch(err => console.error('ESP32 write error:', err));
    }, 100);

    return () => clearInterval(interval);
  }, [liveState]);

  return (
    <BleContext.Provider value={{ liveState, updateLiveState, connectToESP32 }}>
      {children}
    </BleContext.Provider>
  );
};

export const useBLE = () => {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error('useBLE must be used inside BleProvider');
  return ctx;
};
