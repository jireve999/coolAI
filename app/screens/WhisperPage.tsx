import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Audio } from 'expo-av';
import { useApi } from '../hooks/useApi';

const WhisperPage = () => {
  const [result, setResult] = useState('Test');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording>();
  const { speechToText } = useApi();

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })
    const uri = recording?.getURI();
    console.log('uri',uri);
    uploadAudio();
  };

  const uploadAudio = async () => {
    const uri = recording?.getURI();
    console.log('uri',uri);

    if (!uri) {
      return;
    }

    setLoading(true);
    try {
      const response = await speechToText(uri);
      console.log('response', response);

      if (response.error && response.error.code === 'insufficient_quota') {
        setResult(`You have exceeded your current quota. Please check your plan and billing details.`);
      } else if (response.text) {
        setResult(response.text);
      } else {
        setResult('Failed to transcribe audio.');
      }
    } catch (err: any) {
      console.error('Failed to upload audio', err.message);
      setResult(`Error uploading audio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!recording && (
        <TouchableOpacity
          style={styles.button}
          onPress={startRecording}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Record speech
          </Text>
        </TouchableOpacity>  
      )}
      {recording && (
        <TouchableOpacity
          style={styles.buttonStop}
          onPress={stopRecording}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            Stop recording
          </Text>
        </TouchableOpacity>  
      )}
      {loading && <ActivityIndicator style={{ marginTop: 20}} size={'large'}  />}
      {result && <Text style={styles.text}>{result}</Text>}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  text: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonStop: {
    backgroundColor: '#ff0000',
    borderRadius: 5,
    padding: 10,
  },
});

export default WhisperPage;