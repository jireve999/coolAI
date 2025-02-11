import OpenAI from 'openai';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { STORAGE_API_KEY } from '../constants/constants';

export enum Creator {
  Me = 0,
  Bot = 1,
}

export interface Message {
  text: string;
  from: Creator;
}

let messageSubject: BehaviorSubject<Message[]>;

export function useApi() {
  const dummyMessages = [
    {
      text: 'What is Javascript?',
      from: Creator.Me,
    },
    {
      text: 'Javascript is a programming language.',
      from: Creator.Bot,
    },
  ];
  const [messages, setMessages] = useState<Message[]>(dummyMessages);

  if (!messageSubject) {
    messageSubject = new BehaviorSubject(dummyMessages);
  }

  useEffect(() => {
    const subscription = messageSubject.subscribe((messages) => {
      console.log('NEW MESSAGE');
      setMessages(messages);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getCompletion = async (prompt: string) => {
    const apiKey = await AsyncStorage.getItem(STORAGE_API_KEY);

    if (!apiKey) {
      console.error('API key not found');
      return;
    }

    // Add user message
    const newMessage: Message = {
      text: prompt,
      from: Creator.Me,
    };
    messageSubject.next([...messageSubject.value, newMessage]);

    try {
      // Initialize DeepSeek client
      const deepseek = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1', // Official API endpoint
        apiKey: apiKey,
      });

      // API call with required parameters
      const completion = await deepseek.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'deepseek-chat',
        temperature: 0.7,
        stream: false, // Set to true for streaming
      });

      // Handle response
      const botResponse = completion.choices[0].message.content;
      const botMessage: Message = {
        text: botResponse || 'No response from API',
        from: Creator.Bot,
      };
      messageSubject.next([...messageSubject.value, botMessage]);
      return true;
    } catch (error: any) {
      console.error('API Error:', error);

      // Enhanced error handling
      const errorMessage = error.message || 'API request failed';
      const statusMessage = error.status === 429 
        ? 'Rate limit exceeded' 
        : errorMessage;

      const botMessage: Message = {
        text: `[DeepSeek Error] ${statusMessage}`,
        from: Creator.Bot,
      };
      messageSubject.next([...messageSubject.value, botMessage]);
      return false;
    }
  };

  // Unsupported features
  const generateImage = async () => {
    throw new Error('Image generation not supported');
  };

  const speechToText = async () => {
    throw new Error('Speech-to-text not supported');
  };

  return {
    messages,
    getCompletion,
    generateImage,
    speechToText
  };
}