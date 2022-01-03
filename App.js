import React, {useCallback} from 'react';
import {View, Text, TextInput, Button} from 'react-native';
import firebase from 'firebase';
import firestore from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GiftedChat} from 'react-native-gifted-chat';

const firebaseConfig = {
  apiKey: 'AIzaSyBrSWTiOsS2PZ6EFmmQ6sTL4zZB2jgcSL0',
  authDomain: 'react-native-chat-9b00f.firebaseapp.com',
  projectId: 'react-native-chat-9b00f',
  storageBucket: 'react-native-chat-9b00f.appspot.com',
  messagingSenderId: '358750359624',
  appId: '1:358750359624:web:ec3b63b2685d1bfa34087d',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const chatsRef = db.collection('chats');
export default function App() {
  const [user, setUser] = React.useState(null);
  const [name, setName] = React.useState('');
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messageFireStore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate()};
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      // setMessages(messageFireStore);
      appendMessages(messageFireStore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    messages => {
      setMessages(prevMessages => GiftedChat.append(prevMessages, messages));
    },
    [messages],
  );

  React.useEffect(() => {
    readUser();
  }, []);

  const readUser = () => {
    const user = AsyncStorage.getItem('user');
    if (user) {
      setUser(user);
    }
  };
  if (!user) {
    return (
      <View>
        <TextInput
          placeholder="Enter your name"
          value={name}
          onChangeText={text => setName(text)}
        />
        <Button title="Start Chat" onPress={handlePress} />
      </View>
    );
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }
  async function handleSend(messages) {
    const writes = messages.map(m => {
      chatsRef.add(m);
      Promise.all(writes);
    });
  }

  return (
    <View>
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
    </View>
  );
}
