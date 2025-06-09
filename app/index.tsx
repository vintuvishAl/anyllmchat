import React from 'react';
import ChatView from '../components/ChatView';

export default function HomeScreen() {
  // No authentication required - show the chat directly
  return <ChatView userName="user" />;
}
