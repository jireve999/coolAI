import axios from 'axios';
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
      // Call DeepSeek API (required parameters based on documentation)
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          messages: [{ role: 'user', content: prompt }],
          model: 'deepseek-chat',
          temperature: 1.3,
          top_p: 1, // Required parameter
          frequency_penalty: 0, // Required parameter
          presence_penalty: 0, // Required parameter
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json', // Required header
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle response (based on DeepSeek API response structure)
      const botResponse = response.data.choices[0].message.content;
      const botMessage: Message = {
        text: botResponse || 'No response from API',
        from: Creator.Bot,
      };
      messageSubject.next([...messageSubject.value, botMessage]);
      return true;
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);

      // Enhanced error handling based on documentation
      const errorMessage = error.response?.data?.error?.message || 'API request failed';
      const statusSpecificMessage = error.response?.status === 429
        ? 'Rate limit exceeded. Please try again later.'
        : errorMessage;

      const botMessage: Message = {
        text: `[DeepSeek Error] ${statusSpecificMessage}`,
        from: Creator.Bot,
      };
      messageSubject.next([...messageSubject.value, botMessage]);
      return false;
    }
  };

  // DeepSeek does not currently support these features
  const generateImage = async () => {
    throw new Error('Image generation is not supported by DeepSeek.');
  };

  const speechToText = async () => {
    throw new Error('Speech-to-text is not supported by DeepSeek.');
  };

  return {
    messages,
    getCompletion,
    // generateImage,
    // speechToText,
  };
}