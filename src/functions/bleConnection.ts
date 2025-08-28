import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform, PermissionsAndroid } from 'react-native';

// SAMPLING EVERY .5 ms -- 200 samples per second transmitted
// 0-180 for range of motion in each finger (int)
// autoSet for sliderGroup, all to 0, 50

const SERVICE_UUID_NICLA = '180c';
const CHAR_UUID_NICLA = '2a56';
const SERVICE_UUID_ESP32 = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHAR_UUID_ESP32 = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const bleManager = new BleManager();

export type ConnectionResult = {
  success: boolean;
  error?: string;
};

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

// NEW: pass a setter from BLEContext to store live data
export const connectToDevices = async (
  setDeviceData: (deviceName: string, value: string) => void,
): Promise<ConnectionResult> => {
  const hasPermission = await requestAndroidPermissions();
  if (!hasPermission) {
    return { success: false, error: 'Bluetooth permissions are needed.' };
  }

  const foundDevices: Device[] = [];
  const timeout = 10000; // 10s scanning timeout

  bleManager.startDeviceScan(
    null,
    { allowDuplicates: false },
    (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!device?.name) return;

      if (device.name.startsWith('Nicla') || device.name.startsWith('ESP32')) {
        if (!foundDevices.find(d => d.id === device.id)) {
          foundDevices.push(device);
        }
      }
    },
  );

  await new Promise<void>(resolve =>
    setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve();
    }, timeout),
  );

  if (foundDevices.length === 0) {
    return {
      success: false,
      error:
        'No devices found. Please ensure the prosthesis is in range and powered on.',
    };
  }

  // Connect to all found devices and monitor live data
  for (const device of foundDevices) {
    try {
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      const isNicla = device.name?.startsWith('Nicla');
      const serviceUUID = isNicla ? SERVICE_UUID_NICLA : SERVICE_UUID_ESP32;
      const charUUID = isNicla ? CHAR_UUID_NICLA : CHAR_UUID_ESP32;

      connectedDevice.monitorCharacteristicForService(
        serviceUUID,
        charUUID,
        (error, characteristic) => {
          if (error) {
            console.error(error);
            return;
          }
          if (characteristic?.value) {
            const decoded = Buffer.from(
              characteristic.value,
              'base64',
            ).toString('utf8');

            // 🔹 Save the live value in BLEContext
            setDeviceData(device.name || 'unknown', decoded);

            // Optional: also log for debugging
            console.log(`${device.name} data: ${decoded}`);
          }
        },
      );
    } catch (err: unknown) {
      console.error(err);
      return {
        success: false,
        error: `Failed to connect to ${device.name}`,
      };
    }
  }

  return { success: true };
};
