import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Text,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const SERVICE_UUID_NICLA = '180c';
const CHAR_UUID_NICLA = '2a56';

const SERVICE_UUID_ESP32 = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const CHAR_UUID_ESP32 = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const ConnectionHandler: React.FC = () => {
  const [bleManager] = useState(() => new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedData, setConnectedData] = useState<{ [id: string]: string }>(
    {},
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestAndroidPermissions();
    }
    return () => {
      bleManager.destroy();
    };
  }, [bleManager]);

  const requestAndroidPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const allGranted = Object.values(granted).every(
        v => v === PermissionsAndroid.RESULTS.GRANTED,
      );
      if (!allGranted) {
        Alert.alert(
          'Permissions required',
          'Bluetooth permissions are needed for this app.',
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const scanForDevices = () => {
    setDevices([]);
    bleManager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error(error);
          return;
        }
        if (
          device?.name &&
          (device.name.startsWith('Nicla') || device.name.startsWith('ESP32'))
        ) {
          setDevices(prev => {
            if (!prev.find(d => d.id === device.id)) {
              return [...prev, device];
            }
            return prev;
          });
        }
      },
    );

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
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
            setConnectedData(prev => ({
              ...prev,
              [device.id]: decoded,
            }));
          }
        },
      );

      Alert.alert('Connected', `Connected to ${device.name}`);
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        Alert.alert('Connection error', error.message);
      } else {
        Alert.alert('Connection error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Button title="Scan for Devices" onPress={scanForDevices} />

      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              marginVertical: 10,
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              borderColor: '#ccc',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>ID: {item.id}</Text>
            <Text>Data: {connectedData[item.id] ?? 'No data yet'}</Text>
            <Button title="Connect" onPress={() => connectToDevice(item)} />
          </View>
        )}
      />
    </View>
  );
};

export default ConnectionHandler;
