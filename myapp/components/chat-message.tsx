import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatBalanceCard from './chat-balance-card';
import ChatSpendingCard from './chat-spending-card';
import ChatBudgetCard from './chat-budget-card';
import ChatTransactionCard from './chat-transaction-card';
import ChatPartyCard from './chat-party-card';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUri?: string;
  richContent?: {
    type: 'balance' | 'spending' | 'budget' | 'transaction' | 'party';
    transactionType?: 'expense' | 'income';
    data: any;
  };
}

interface ChatMessageProps {
  message: Message;
  onNavigate?: (screen: string) => void;
  userName?: string;
}

export default function ChatMessage({ message, onNavigate, userName = 'You' }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Format text: handle bold and formatting
  const formatText = (text: string) => {
    const lines = text.split('\n');
    const formattedLines: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) {
        formattedLines.push(<View key={`space-${index}`} style={{ height: 6 }} />);
        return;
      }

      // Check if it's a header (starts with emoji or has specific patterns)
      const isHeader = /^[📊💰📈⚠️⚡✅🎯👥🏦💸🤖🔔📱💡🎉✨🔍]/.test(line);
      
      // Check if it's a bullet point
      const isBullet = /^[•\-\*]\s/.test(line.trim());
      
      // Parse bold text (**text** or *text*)
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const textElements: React.ReactElement[] = [];

      parts.forEach((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          textElements.push(
            <Text key={`bold-${index}-${partIndex}`} style={styles.boldText}>
              {part.slice(2, -2)}
            </Text>
          );
        } else if (part.startsWith('*') && part.endsWith('*')) {
          // Italic/emphasis
          textElements.push(
            <Text key={`italic-${index}-${partIndex}`} style={styles.boldText}>
              {part.slice(1, -1)}
            </Text>
          );
        } else if (part) {
          textElements.push(
            <Text key={`text-${index}-${partIndex}`}>{part}</Text>
          );
        }
      });

      if (isHeader) {
        formattedLines.push(
          <Text key={`header-${index}`} style={styles.headerText}>
            {textElements}
          </Text>
        );
      } else if (isBullet) {
        const bulletText = line.replace(/^[•\-\*]\s/, '');
        formattedLines.push(
          <View key={`bullet-${index}`} style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{bulletText}</Text>
          </View>
        );
      } else {
        formattedLines.push(
          <Text key={`text-${index}`} style={styles.text}>
            {textElements}
          </Text>
        );
      }
    });

    return formattedLines;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={20} color="#2563eb" />
          </View>
        )}
        
        <View style={[styles.messageContent, isUser && styles.userMessageContent]}>
          <View style={[styles.nameRow, isUser && styles.userNameRow]}>
            <Text style={[styles.name, isUser && styles.userName]}>
              {isUser ? userName : 'AI Assistant'}
            </Text>
            <Text style={styles.time}>
              {message.timestamp.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          <View style={[styles.bubble, isUser && styles.userBubble]}>
            {message.imageUri && (
              <Animated.Image 
                source={{ uri: message.imageUri }}
                style={styles.messageImage}
              />
            )}
            
            <View style={styles.textContainer}>
              {formatText(message.text)}
            </View>
          </View>

          {/* Rich content cards */}
          {message.richContent && (
            <View style={styles.richContent}>
              {message.richContent.type === 'balance' && (
                <ChatBalanceCard 
                  accounts={message.richContent.data.accounts}
                  onViewAllPress={() => onNavigate?.('/accounts')}
                />
              )}
              {message.richContent.type === 'spending' && (
                <ChatSpendingCard 
                  data={message.richContent.data}
                  onViewDetailsPress={() => onNavigate?.('/(tabs)/statistics')}
                />
              )}
              {message.richContent.type === 'budget' && (
                <ChatBudgetCard 
                  budgets={message.richContent.data.budgets}
                  onManageBudgetsPress={() => onNavigate?.('/budget')}
                />
              )}
              {message.richContent.type === 'transaction' && (
                <ChatTransactionCard 
                  type={message.richContent.transactionType || 'expense'}
                  data={message.richContent.data}
                />
              )}
              {message.richContent.type === 'party' && (
                <ChatPartyCard 
                  data={message.richContent.data}
                />
              )}
            </View>
          )}
        </View>

        {isUser && (
          <View style={[styles.avatar, styles.userAvatar]}>
            <Ionicons name="person" size={20} color="#2563eb" />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    marginRight: 0,
    marginLeft: 12,
    backgroundColor: '#f0fdf4',
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userNameRow: {
    flexDirection: 'row-reverse',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 8,
    letterSpacing: 0.3,
  },
  userName: {
    marginRight: 0,
    marginLeft: 8,
    color: '#059669',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  bubble: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#eff6ff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  textContainer: {
    gap: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '400',
  },
  boldText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginLeft: 8,
    marginVertical: 3,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 10,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '400',
  },
  richContent: {
    marginTop: 8,
  },
});
