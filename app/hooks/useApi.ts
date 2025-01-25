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
    // Add our own message
    const newMessage: Message = {
      text: prompt,
      from: Creator.Me,
    };
    messageSubject.next([...messageSubject.value, newMessage]);

    // Setup OpenAI
    const openai = new OpenAI({
      apiKey,
    });
    try {
      // Get completion
      const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });
      // Add bot message
      const botMessage: Message = {
        text: response.choices[0].message.content || 'No response from API',
        from: Creator.Bot,
      };
      messageSubject.next([...messageSubject.value, botMessage]);
      return true;
    } catch (error: any) {
      console.error('Error fetching completion:', error);
      if (error.response && error.response.status === 429) {
        const errorMessage = 'You have exceeded your current quota. Please try again later or check your plan and billing details.';
        const botMessage: Message = {
          text: errorMessage,
          from: Creator.Bot,
        };
        messageSubject.next([...messageSubject.value, botMessage]);
      }
    }
  }

  const generateImage = async (prompt: string) => {
    const apiKey = await AsyncStorage.getItem(STORAGE_API_KEY);
    if (!apiKey) {
      console.error('API key not found');
      return;
    }

    // Setup OpenAI
    const openai = new OpenAI({
      apiKey,
    });

    try {
      const response = await openai.images.generate({
        prompt,
        n: 1,
        size: '1024x1024',
      });
      return response.data[0].url;
    } catch (error: any) {
      console.error('Error generating image:', error);
      if (error.response && error.response.status === 429) {
        console.error('You have exceeded your current quota. Please try again later or check your plan and billing details.');
      }
      return null;
    }
  }

  const speechToText = async (audioUri: string) => {
    const apiKey = await AsyncStorage.getItem(STORAGE_API_KEY);
    if (!apiKey) {
      console.error('API key not found');
      return;
    }

    const formData = new FormData();
    const imageData = {
      uri: audioUri,
      type: 'audio/mp4',
      name: 'audio.m4a',
    };
    formData.append('file', imageData as unknown as Blob);
    formData.append('model', 'whisper-1');

    return fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).then((response) => response.json())
  };

  return {
    messages,
    getCompletion,
    generateImage,
    speechToText
  }
}