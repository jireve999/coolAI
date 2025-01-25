import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_API_KEY } from '../constants/constants';
import Toast from 'react-native-root-toast';

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useLayoutEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async() => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_API_KEY);
      if (value !== null) {
        setApiKey(value);
        setHasKey(true);
      }
    } catch(e) {
      Alert.alert('Error', 'Could not load API key');
    }
  };

  const saveApiKey = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_API_KEY, apiKey);
      setHasKey(true);
      Toast.show('API key saved', { duration: Toast.durations.SHORT });
    } catch (e) {
      Alert.alert('Error', 'Could not save API key');
    }
  };

  const removeApiKey = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_API_KEY);
      setHasKey(false);
      setApiKey('');
      Toast.show('API key saved', { duration: Toast.durations.SHORT });
    } catch (e) {
      Alert.alert('Error', 'Could not save API key');
    }
  };
  
  return (
    <View style={styles.container}>
      { hasKey && (
        <>
          <Text style={styles.label}>Your are all set!</Text>
          <TouchableOpacity onPress={removeApiKey} style={styles.button}>
            <Text style={styles.buttonText}>Remove API key</Text>
          </TouchableOpacity>
        </>
      )}

      {!hasKey && (
        <>
          <Text style={styles.label}>No API key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your API key"
          />
          <TouchableOpacity onPress={saveApiKey} style={styles.button}>
            <Text style={styles.buttonText}>Save API key</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#18191a',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SettingsPage;