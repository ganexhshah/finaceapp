import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatGreetingProps {
  userName: string;
}

export default function ChatGreeting({ userName }: ChatGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = userName.split(' ')[0];

    // Determine greeting based on time
    let greeting = '';
    let emoji = '';
    let nepaliGreeting = '';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good Morning';
      emoji = '🌅';
      nepaliGreeting = 'शुभ प्रभात';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
      emoji = '☀️';
      nepaliGreeting = 'शुभ दिन';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good Evening';
      emoji = '🌆';
      nepaliGreeting = 'शुभ साँझ';
    } else {
      greeting = 'Good Night';
      emoji = '🌙';
      nepaliGreeting = 'शुभ रात्री';
    }

    return { greeting, emoji, nepaliGreeting, firstName };
  };

  const { greeting, emoji, nepaliGreeting, firstName } = getGreeting();

  return (
    <View style={styles.container}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.greeting}>
        {greeting}, {firstName}!
      </Text>
      <Text style={styles.nepaliGreeting}>
        {nepaliGreeting} • Namaste 🙏
      </Text>
      <Text style={styles.subtitle}>
        How can I help you with your finances today?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  nepaliGreeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '400',
  },
});
