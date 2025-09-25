// screens/About.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

export default function About() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.screen}>
      <Pressable
        style={styles.closeButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.container}>
        <Image
          source={require('../assets/information-outline.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Neuroprosthetics Control System</Text>
        <Text style={styles.description}>
          Este sistema de control de prótesis fue diseñado y desarrollado por el
          equipo de Neuroprosthetics, con el apoyo y financiamiento de COECyTJAL
          y UAG.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 35,
    height: 35,
    opacity: 0.8,
    marginBottom: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    width: '70%',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: '#ddd',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
});
