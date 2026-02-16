import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddScreen() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Chat Assistant',
      description: 'Ask questions & get help',
      icon: 'chatbubble-ellipses',
      color: '#2563eb',
      bgColor: '#dbeafe',
      route: '/chat',
    },
    {
      title: 'Add Income',
      description: 'Record your earnings',
      icon: 'trending-up',
      color: '#10b981',
      bgColor: '#d1fae5',
      route: '/income',
    },
    {
      title: 'Add Expense',
      description: 'Track your spending',
      icon: 'trending-down',
      color: '#ef4444',
      bgColor: '#fee2e2',
      route: '/expense',
    },
    {
      title: 'Set Budget',
      description: 'Plan your finances',
      icon: 'wallet',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      route: '/budget',
    },
    {
      title: 'Manage Accounts',
      description: 'View and edit accounts',
      icon: 'card',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      route: '/accounts',
    },
    {
      title: 'Manage Parties',
      description: 'Track receivables & payables',
      icon: 'people',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      route: '/parties',
    },
    {
      title: 'Categories',
      description: 'Organize transactions',
      icon: 'grid',
      color: '#ec4899',
      bgColor: '#fce7f3',
      route: '/manage-categories',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Actions</Text>
        <Text style={styles.headerSubtitle}>What would you like to do?</Text>
      </View>

      {/* Quick Actions Grid */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
                <Ionicons name={action.icon as any} size={32} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  actionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
