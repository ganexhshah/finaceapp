import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ollamaService, { Message, ChatSession } from '@/lib/ollama';
import chatStorage from '@/lib/chat-storage';
import ChatSidebar from '@/components/chat-sidebar';
import ChatSettingsModal from '@/components/chat-settings-modal';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2:3b');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const savedSessions = await chatStorage.getSessions();
    setSessions(savedSessions);
    
    const activeId = await chatStorage.getActiveSessionId();
    if (activeId) {
      const activeSession = savedSessions.find(s => s.id === activeId);
      if (activeSession) {
        setActiveSessionId(activeId);
        setMessages(activeSession.messages);
      }
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setActiveSessionId(newSession.id);
    setMessages([]);
    chatStorage.setActiveSessionId(newSession.id);
    setShowSidebar(false);
  };

  const selectSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      await chatStorage.setActiveSessionId(sessionId);
    }
  };

  const deleteSession = async (sessionId: string) => {
    await chatStorage.deleteSession(sessionId);
    await loadSessions();
    
    if (activeSessionId === sessionId) {
      createNewSession();
    }
  };

  const clearAllSessions = async () => {
    await chatStorage.clearAllSessions();
    setSessions([]);
    createNewSession();
    setShowSidebar(false);
  };

  const saveCurrentSession = async () => {
    if (!activeSessionId || messages.length === 0) return;

    const session: ChatSession = {
      id: activeSessionId,
      title: chatStorage.generateSessionTitle(messages[0]?.content || 'New Chat'),
      messages,
      createdAt: sessions.find(s => s.id === activeSessionId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await chatStorage.saveSession(session);
    await loadSessions();
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    // Create session if doesn't exist
    if (!activeSessionId) {
      const newSessionId = Date.now().toString();
      setActiveSessionId(newSessionId);
      await chatStorage.setActiveSessionId(newSessionId);
    }

    try {
      // Add system message for financial context
      const systemMessage: Message = {
        id: 'system',
        role: 'system',
        content: 'You are a helpful financial assistant. Help users manage their finances, track expenses, create budgets, and provide financial advice. Be concise and actionable.',
        timestamp: new Date(),
      };

      const response = await ollamaService.chat(
        [systemMessage, ...newMessages],
        selectedModel
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      // Save session
      setTimeout(() => saveCurrentSession(), 500);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure Ollama is running on localhost:11434',
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    { icon: 'wallet', text: 'Show my spending summary', color: '#10b981' },
    { icon: 'trending-up', text: 'Create a monthly budget', color: '#2563eb' },
    { icon: 'analytics', text: 'Analyze my expenses', color: '#f59e0b' },
    { icon: 'bulb', text: 'Give me saving tips', color: '#8b5cf6' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowSidebar(true)}>
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.headerTitle}>AI Assistant</Text>
          </View>
          <Text style={styles.headerSubtitle}>Powered by Ollama</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#eff6ff', '#dbeafe']}
                style={styles.emptyIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={48} color="#2563eb" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>Welcome to AI Assistant</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything about your finances or try one of these:
              </Text>

              <View style={styles.suggestedPrompts}>
                {suggestedPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptCard}
                    onPress={() => setInputText(prompt.text)}
                  >
                    <View style={[styles.promptIcon, { backgroundColor: `${prompt.color}20` }]}>
                      <Ionicons name={prompt.icon as any} size={20} color={prompt.color} />
                    </View>
                    <Text style={styles.promptText}>{prompt.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
                ]}
              >
                {message.role === 'assistant' && (
                  <View style={styles.assistantAvatar}>
                    <Ionicons name="sparkles" size={16} color="#2563eb" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userText : styles.assistantText,
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              </View>
            ))
          )}

          {loading && (
            <View style={styles.loadingWrapper}>
              <View style={styles.assistantAvatar}>
                <Ionicons name="sparkles" size={16} color="#2563eb" />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator color="#2563eb" size="small" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <ChatSidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
      />

      <ChatSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  suggestedPrompts: {
    width: '100%',
    gap: 12,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  promptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1f2937',
  },
  loadingWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
    paddingVertical: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});
