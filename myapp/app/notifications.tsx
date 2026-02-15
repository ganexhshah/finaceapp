import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: 'income' | 'expense' | 'budget' | 'party' | 'account' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  amount?: number;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      // Fetch recent data to generate notifications
      const [incomesRes, expensesRes, budgetsRes, partiesRes] = await Promise.all([
        api.getIncomes(),
        api.getExpenses(),
        api.getBudgets(),
        api.getParties(),
      ]);

      const generatedNotifications: Notification[] = [];

      // Generate notifications from recent incomes (last 7 days)
      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        const recentIncomes = incomesList
          .filter((income: any) => {
            const incomeDate = new Date(income.date);
            const daysDiff = Math.floor((Date.now() - incomeDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7;
          })
          .slice(0, 3);

        recentIncomes.forEach((income: any) => {
          const incomeDate = new Date(income.date);
          const timeAgo = getTimeAgo(incomeDate);
          generatedNotifications.push({
            id: `income-${income.id}`,
            type: 'income',
            title: 'Income Added',
            message: `${income.title} - ${income.category?.name || 'Income'}`,
            time: timeAgo,
            read: Math.random() > 0.5, // Randomly mark some as read
            icon: 'arrow-down',
            color: '#10b981',
            amount: income.amount,
          });
        });
      }

      // Generate notifications from recent expenses (last 7 days)
      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        const recentExpenses = expensesList
          .filter((expense: any) => {
            const expenseDate = new Date(expense.date);
            const daysDiff = Math.floor((Date.now() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7;
          })
          .slice(0, 3);

        recentExpenses.forEach((expense: any) => {
          const expenseDate = new Date(expense.date);
          const timeAgo = getTimeAgo(expenseDate);
          generatedNotifications.push({
            id: `expense-${expense.id}`,
            type: 'expense',
            title: 'Expense Added',
            message: `${expense.title} - ${expense.category?.name || 'Expense'}`,
            time: timeAgo,
            read: Math.random() > 0.5,
            icon: 'arrow-up',
            color: '#ef4444',
            amount: expense.amount,
          });
        });
      }

      // Generate budget alerts
      if (budgetsRes.success && budgetsRes.data) {
        const budgetsData = Array.isArray(budgetsRes.data) ? budgetsRes.data : [];
        budgetsData.forEach((budget: any) => {
          const percentage = budget.percentage || 0;
          if (percentage >= 80) {
            generatedNotifications.push({
              id: `budget-${budget.id}`,
              type: 'budget',
              title: percentage >= 100 ? 'Budget Exceeded!' : 'Budget Alert',
              message: `You have used ${percentage.toFixed(0)}% of your ${budget.category?.name || 'budget'}`,
              time: 'Today',
              read: false,
              icon: 'wallet',
              color: percentage >= 100 ? '#ef4444' : '#f59e0b',
            });
          }
        });
      }

      // Generate party payment reminders
      if (partiesRes.success && partiesRes.data) {
        const partiesList = Array.isArray(partiesRes.data) ? partiesRes.data : [];
        const partiesWithBalance = partiesList.filter((party: any) => party.balance > 0).slice(0, 2);
        
        partiesWithBalance.forEach((party: any) => {
          generatedNotifications.push({
            id: `party-${party.id}`,
            type: 'party',
            title: party.type === 'receive' ? 'Payment Reminder' : 'Payment Due',
            message: party.type === 'receive' 
              ? `Payment due from ${party.name}`
              : `Payment due to ${party.name}`,
            time: '2 days ago',
            read: true,
            icon: 'person',
            color: party.type === 'receive' ? '#10b981' : '#ef4444',
            amount: party.balance,
          });
        });
      }

      // Add welcome notification if no other notifications
      if (generatedNotifications.length === 0) {
        generatedNotifications.push({
          id: 'welcome',
          type: 'system',
          title: 'Welcome!',
          message: 'Start tracking your expenses and income',
          time: 'Just now',
          read: false,
          icon: 'checkmark-circle',
          color: '#10b981',
        });
      }

      // Sort by unread first, then by time
      generatedNotifications.sort((a, b) => {
        if (a.read === b.read) return 0;
        return a.read ? 1 : -1;
      });

      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to empty array
      setNotifications([]);
    }
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <PageHeader title="Notifications" showBack={true} />
      
      <View style={styles.header}>
        <View style={styles.filterTabs}>
          <TouchableOpacity 
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' 
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationItemUnread
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.notificationIcon, { backgroundColor: `${notification.color}20` }]}>
                  <Ionicons name={notification.icon as any} size={24} color={notification.color} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                    {notification.amount !== undefined && (
                      <>
                        <Text style={styles.notificationDot}>•</Text>
                        <Text style={[styles.notificationAmount, { color: notification.color }]}>
                          {notification.type === 'income' ? '+' : notification.type === 'expense' ? '-' : ''}
                          {CURRENCY_SYMBOL}{notification.amount.toLocaleString('en-IN')}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification.id)}
                >
                  <Ionicons name="close" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  notificationDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  notificationAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
