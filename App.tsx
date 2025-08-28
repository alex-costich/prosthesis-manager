import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Connect from './src/pages/Connect';
import Dashboard from './src/pages/Dashboard';
import { BleProvider } from './src/context/BleContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <BleProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Connect" component={Connect} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </BleProvider>
  );
}
