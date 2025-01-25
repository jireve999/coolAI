import { View, Text, Image, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import  React, { useState } from 'react';
import { Creator, useApi } from '../hooks/useApi';
import botImage from '../../assets/bot.jpg';
import userImage from '../../assets/elephant.jpg';

const ChatPage = () => {
  const { getCompletion, messages } = useApi();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSendMessage = async () => {
    if (inputMessage.trim().length > 0) {
      const msg = inputMessage;
      setLoading(true);
      setInputMessage('');
      await getCompletion(inputMessage);
      setLoading(false);
    }
  }

  const renderMessage = ({item}: any) => {
    const isUserMessage = item.from === Creator.Me;
    return (
      <View style={[styles.messageContainer, isUserMessage ? styles.userMessageContainer : styles.botMessageContainer]}>
        <Image 
          source={isUserMessage ? userImage: botImage}
          style={styles.image}
        />
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList 
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginTop: 20}} /> : <></>}
      />
      <View style={styles.container}/>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.textInput} 
          value={inputMessage} 
          onChangeText={setInputMessage} 
          placeholder="Type your message" 
          multiline={true}
          textAlignVertical='top'
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    minHeight: 40,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#18191a',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  sendButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  messageContainer: {
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBlockColor: '#DFDFDF',
    borderBottomWidth: 1,
  },
  userMessageContainer: {
    backgroundColor: '#fff',
  },
  botMessageContainer: {
    backgroundColor: '#f5f5f6',
  },
});

export default ChatPage;