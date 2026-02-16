import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatMessage, { Message } from '@/components/chat-message';
import ChatInput from '@/components/chat-input';
import ChatGreeting from '@/components/chat-greeting';
import ChatShortcuts from '@/components/chat-shortcuts';
import groqService from '@/lib/groq';
import { AIActionParser } from '@/lib/ai-actions';
import type { Message as GroqMessage, FinancialContext } from '@/lib/groq';

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('You');
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    // Load user name
    const loadUserName = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || 'You');
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };
    loadUserName();
  }, []);

  const handleShortcutPress = (prompt: string) => {
    setShowGreeting(false);
    handleSend(prompt);
  };

  const handleNewChat = () => {
    // Clear messages and start fresh
    setMessages([
      {
        id: Date.now().toString(),
        text: '🙏 Namaste! I\'m your AI financial assistant.\n\nI understand English, Nepali & Hinglish!\n\nTry these:\n\n• 📸 Upload bill photo - Auto-extract & add expense\n• "maile 200 ko momo khako" - Add expense\n• "show balance" or "balance dekha" - View balances\n• "analyze spending" - Get insights\n• "paisa kati cha?" - Check balance\n\nWhat would you like to do?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSearch = () => {
    router.push('/search');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleSend = async (text: string, imageUri?: string) => {
    // Hide greeting after first message
    setShowGreeting(false);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      imageUri,
    };

    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // If image is uploaded, process it with OCR
      if (imageUri) {
        const ocrService = (await import('@/lib/ocr-service')).default;
        
        const processingMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '🔍 Analyzing bill image...',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, processingMessage]);

        const billData = await ocrService.processBillImage(imageUri);

        if (billData && billData.amount > 0) {
          // Create expense from bill data
          const expenseData = {
            title: billData.merchantName || billData.items[0]?.name || 'Bill Payment',
            amount: billData.amount,
            category: billData.category || 'Shopping',
            date: billData.date || new Date().toISOString(),
          };

          const result = await AIActionParser.addExpense(expenseData);

          let responseText = '';
          if (result.success) {
            responseText = `✅ Bill processed successfully!\n\n`;
            responseText += `📄 Merchant: ${billData.merchantName || 'Unknown'}\n`;
            responseText += `💰 Amount: Rs. ${billData.amount.toLocaleString()}\n`;
            responseText += `📁 Category: ${billData.category}\n\n`;
            
            if (billData.items && billData.items.length > 0) {
              responseText += `Items:\n`;
              billData.items.slice(0, 5).forEach(item => {
                responseText += `• ${item.name}: Rs. ${item.price}\n`;
              });
            }
            
            responseText += `\n✅ Expense added to your account!`;
          } else {
            responseText = `⚠️ Bill analyzed but failed to add expense:\n\n`;
            responseText += `Amount: Rs. ${billData.amount}\n`;
            responseText += `Merchant: ${billData.merchantName || 'Unknown'}\n\n`;
            responseText += result.message;
          }

          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          return;
        } else {
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: '❌ Could not extract bill information from the image. Please try:\n\n• Taking a clearer photo\n• Ensuring good lighting\n• Making sure the bill is fully visible\n\nOr you can manually enter: "I spent [amount] on [item]"',
            sender: 'bot',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Parse message for actions (existing code)
      const parsedAction = AIActionParser.parseMessage(text);

      // If action detected with high confidence, execute it
      if (parsedAction.type !== 'none' && parsedAction.confidence > 0.7) {
        const actionResult = await AIActionParser.executeAction(parsedAction);

        // Only proceed if action was successful or it's a navigation action
        if (actionResult.success) {
          // Handle navigation actions
          if (actionResult.message === 'navigate_transactions') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '📊 Opening your transactions...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/(tabs)/transactions');
            }, 1000);
            return;
          }

          if (actionResult.message === 'navigate_budget') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '💰 Opening your budget...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/budget');
            }, 1000);
            return;
          }

          if (actionResult.message === 'navigate_statistics') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '📈 Opening statistics...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/(tabs)/statistics');
            }, 1000);
            return;
          }

          if (actionResult.message === 'navigate_accounts') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '🏦 Opening your accounts...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/accounts');
            }, 1000);
            return;
          }

          if (actionResult.message === 'navigate_parties') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '👥 Opening parties...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/parties');
            }, 1000);
            return;
          }

          if (actionResult.message === 'navigate_set_budget') {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: '🎯 Opening budget settings...',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            setTimeout(() => {
              router.push('/budget');
            }, 1000);
            return;
          }

          // Show success message for add actions or analysis
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: actionResult.message,
            sender: 'bot',
            timestamp: new Date(),
            richContent: actionResult.richContent,
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          return;
        } else {
          // Action failed - show error and don't use AI response
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `❌ ${actionResult.message}`,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
      }

      // If no simple action detected, try AI-powered story parsing for complex messages
      if (text.split(' ').length > 10) { // Only for longer messages
        try {
          const storyResult = await AIActionParser.parseStoryAndExecute(text);
          
          if (storyResult.success && storyResult.transactions && storyResult.transactions.length > 0) {
            // Show summary message
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: storyResult.message,
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            return;
          }
        } catch (error) {
          console.error('Story parsing error:', error);
          // Continue to regular AI response if story parsing fails
        }
      }

      // Fetch financial context for AI
      const financialData = await AIActionParser.fetchFinancialData();
      let financialContext: FinancialContext | undefined;

      if (financialData) {
        financialContext = AIActionParser.buildFinancialContext(financialData);
      }

      // If no action or action failed, get AI response with context
      const conversationHistory: GroqMessage[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const aiResponse = await groqService.chatWithFinance(text, conversationHistory, financialContext);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="sparkles" size={24} color="#2563eb" />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <Ionicons name="add-outline" size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage 
            message={item} 
            userName={userName}
            onNavigate={(screen) => {
              router.push(screen as any);
            }}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          showGreeting && messages.length === 0 ? (
            <>
              <ChatGreeting userName={userName} />
              <ChatShortcuts onShortcutPress={handleShortcutPress} />
            </>
          ) : null
        }
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  typingContainer: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  typingBubble: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
});
