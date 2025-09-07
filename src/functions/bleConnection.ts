// src/ble/ble.ts
// Dependencies: react-native-ble-plx, buffer
// Purpose:
// - Scan & connect to BOTH devices (Nicla + ESP32). Return failure if only one is found/connected.
// - Monitor notifications from each device and push into your BLEContext via setDeviceData.
// - Provide sendDataToESP32(data: string) for writes to ESP32 RX characteristic.

import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform, PermissionsAndroid } from 'react-native';

export type ConnectionResult = { success: boolean; error?: string };

// UUIDs (as per your setup)
export const SERVICE_UUID_NICLA = '180c';
export const CHAR_UUID_NICLA = '2a56';

export const SERVICE_UUID_ESP32 = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const CHAR_UUID_ESP32_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notify
export const CHAR_UUID_ESP32_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write

const bleManager = new BleManager();

// Hold refs so other modules/components can send data
let esp32Device: Device | null = null;
let niclaDevice: Device | null = null;
let esp32NotifySub: Subscription | null = null;
let niclaNotifySub: Subscription | null = null;

export const requestAndroidPermissions = async (): Promise<boolean> => {
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

export const connectToDevices = async (
  setDeviceData: (deviceName: string, value: string) => void,
): Promise<ConnectionResult> => {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    return { success: false, error: 'Bluetooth permissions are needed.' };
  }

  // Reset any previous state
  await disconnectFromDevices();

  const found: Record<'esp' | 'nicla', Device | null> = {
    esp: null,
    nicla: null,
  };

  // Scan for up to 10s
  const timeout = 10000;
  const scanStop = new Promise<void>(resolve => {
    bleManager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }
        if (!device?.name) return;

        if (!found.esp && device.name.startsWith('ESP32')) {
          found.esp = device;
        } else if (!found.nicla && device.name.startsWith('Nicla')) {
          found.nicla = device;
        }

        // Early exit if both spotted
        if (found.esp && found.nicla) {
          bleManager.stopDeviceScan();
          resolve();
        }
      },
    );

    setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve();
    }, timeout);
  });
  await scanStop;

  if (!found.esp || !found.nicla) {
    return {
      success: false,
      error: 'Both ESP32 and Nicla must be found and connected.',
    };
  }

  // Connect ESP32
  try {
    esp32Device = await found.esp.connect();
    await esp32Device.discoverAllServicesAndCharacteristics();

    esp32NotifySub = esp32Device.monitorCharacteristicForService(
      SERVICE_UUID_ESP32,
      CHAR_UUID_ESP32_TX,
      (error, characteristic) => {
        if (error) {
          console.error('ESP32 notify error:', error);
          return;
        }
        if (characteristic?.value) {
          const decoded = Buffer.from(characteristic.value, 'base64').toString(
            'utf8',
          );
          setDeviceData(esp32Device?.name || 'ESP32', decoded);
          // console.log('ESP32 ->', decoded);
        }
      },
    );
  } catch (err) {
    console.error('ESP32 connect error:', err);
    await disconnectFromDevices();
    return { success: false, error: 'Failed to connect to ESP32.' };
  }

  // Connect Nicla
  try {
    niclaDevice = await found.nicla.connect();
    await niclaDevice.discoverAllServicesAndCharacteristics();

    niclaNotifySub = niclaDevice.monitorCharacteristicForService(
      SERVICE_UUID_NICLA,
      CHAR_UUID_NICLA,
      (error, characteristic) => {
        if (error) {
          console.error('Nicla notify error:', error);
          return;
        }
        if (characteristic?.value) {
          const decoded = Buffer.from(characteristic.value, 'base64').toString(
            'utf8',
          );
          setDeviceData(niclaDevice?.name || 'Nicla', decoded);
          // console.log('Nicla ->', decoded);
        }
      },
    );
  } catch (err) {
    console.error('Nicla connect error:', err);
    await disconnectFromDevices();
    return { success: false, error: 'Failed to connect to Nicla.' };
  }

  // If we got here, BOTH are connected
  return { success: true };
};

export const sendDataToESP32 = async (data: string): Promise<boolean> => {
  if (!esp32Device) {
    console.warn('ESP32 not connected.');
    return false;
  }
  try {
    const base64 = Buffer.from(data, 'utf8').toString('base64');
    await esp32Device.writeCharacteristicWithResponseForService(
      SERVICE_UUID_ESP32,
      CHAR_UUID_ESP32_RX,
      base64,
    );
    return true;
  } catch (err) {
    console.error('write ESP32 error:', err);
    return false;
  }
};

export const disconnectFromDevices = async () => {
  try {
    esp32NotifySub?.remove();
    esp32NotifySub = null;
    niclaNotifySub?.remove();
    niclaNotifySub = null;

    if (esp32Device) {
      try {
        await esp32Device.cancelConnection();
      } catch {}
      esp32Device = null;
    }
    if (niclaDevice) {
      try {
        await niclaDevice.cancelConnection();
      } catch {}
      niclaDevice = null;
    }
  } catch (e) {
    console.warn('disconnect error:', e);
  }
};
