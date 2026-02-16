import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Shortcut {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  prompt: string;
  color: string;
  bgColor: string;
}

interface ChatShortcutsProps {
  onShortcutPress: (prompt: string) => void;
}

export default function ChatShortcuts({ onShortcutPress }: ChatShortcutsProps) {
  const shortcuts: Shortcut[] = [
    {
      id: '1',
      icon: 'wallet-outline',
      title: 'Check Balance',
      subtitle: 'View account balances',
      prompt: 'show my balance',
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      id: '2',
      icon: 'trending-down-outline',
      title: 'Add Expense',
      subtitle: 'Record spending',
      prompt: 'I want to add an expense',
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    {
      id: '3',
      icon: 'trending-up-outline',
      title: 'Add Income',
      subtitle: 'Record earnings',
      prompt: 'I want to add income',
      color: '#10b981',
      bgColor: '#f0fdf4',
    },
    {
      id: '4',
      icon: 'stats-chart-outline',
      title: 'Analyze Spending',
      subtitle: 'Get insights',
      prompt: 'analyze my spending',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
    },
    {
      id: '5',
      icon: 'people-outline',
      title: 'Party Balance',
      subtitle: 'Check receivables',
      prompt: 'show my parties',
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    {
      id: '6',
      icon: 'pie-chart-outline',
      title: 'Budget Status',
      subtitle: 'View budgets',
      prompt: 'show budget status',
      color: '#06b6d4',
      bgColor: '#ecfeff',
    },
    {
      id: '7',
      icon: 'camera-outline',
      title: 'Scan Bill',
      subtitle: 'Upload receipt',
      prompt: 'I want to upload a bill',
      color: '#ec4899',
      bgColor: '#fdf2f8',
    },
    {
      id: '8',
      icon: 'list-outline',
      title: 'Transactions',
      subtitle: 'View history',
      prompt: 'show my transactions',
      color: '#64748b',
      bgColor: '#f8fafc',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {shortcuts.map((shortcut) => (
          <TouchableOpacity
            key={shortcut.id}
            style={[styles.card, { backgroundColor: shortcut.bgColor }]}
            onPress={() => onShortcutPress(shortcut.prompt)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: shortcut.color }]}>
              <Ionicons name={shortcut.icon} size={24} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>{shortcut.title}</Text>
            <Text style={styles.cardSubtitle}>{shortcut.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
