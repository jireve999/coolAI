import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

const ImagesPage = () => {
  const [input, setInput] = useState('');
  const { generateImage } = useApi();
  const [image, setImage] = useState<string | null>(null);
  const[loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const imageUrl = await generateImage(input);
      console.log('image', imageUrl);
      if (imageUrl) {
        setImage(imageUrl);
      } else {
        setError('Failed to generate image');
      }
    } catch (err: any) {
      console.error('Error generating image:', err.message);
      setError(`Error generating image: ${err.message}`);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Enter a image description"
        style={styles.input}
        value={input} 
        onChangeText={setInput}
        editable={!loading}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateImage}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Generate image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={{ marginTop: 20 }} size={'large'} />}
      {image && <Image style={{ width: '100%', height: 300, marginTop: 20 }} source={{ uri: image }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
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


export default ImagesPage;