import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ income: 0, expenses: 0, budget: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const [profileRes, incomesRes, expensesRes, budgetsRes] = await Promise.all([
        api.getProfile(),
        api.getIncomes(),
        api.getExpenses(),
        api.getBudgets(),
      ]);

      if (profileRes.success && profileRes.data) {
        const userData = profileRes.data as any;
        setUser(userData.user || userData);
      }

      let totalIncome = 0;
      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        totalIncome = incomesList.reduce((sum: number, income: any) => sum + income.amount, 0);
      }

      let totalExpenses = 0;
      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        totalExpenses = expensesList.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      }

      let totalBudget = 0;
      if (budgetsRes.success && budgetsRes.data) {
        const budgetsData = budgetsRes.data as any;
        const budgetsList = budgetsData.budgets || [];
        totalBudget = budgetsList.reduce((sum: number, budget: any) => sum + budget.amount, 0);
      }

      setStats({ income: totalIncome, expenses: totalExpenses, budget: totalBudget });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const menuItems = [
    { id: 1, title: 'Personal Information', icon: 'person-outline', route: '/personal-info' },
    { id: 2, title: 'Income', icon: 'arrow-down-circle-outline', route: '/income', color: '#10b981' },
    { id: 3, title: 'Expenses', icon: 'arrow-up-circle-outline', route: '/expense', color: '#ef4444' },
    { id: 4, title: 'Budget', icon: 'wallet-outline', route: '/budget', color: '#f59e0b' },
    { id: 5, title: 'Manage Categories', icon: 'grid-outline', route: '/manage-categories', color: '#6366f1' },
    { id: 6, title: 'Transactions', icon: 'list-outline', route: '/(tabs)/transactions' },
    { id: 7, title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
    { id: 8, title: 'Security', icon: 'shield-checkmark-outline', route: '/security' },
    { id: 9, title: 'Help & Support', icon: 'help-circle-outline', route: '/help-support' },
    { id: 10, title: 'About', icon: 'information-circle-outline', route: '/about' },
  ];

  const handleMenuPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else {
      console.log('Navigate to:', item.title);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Profile" />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Text>Avatar</Text>
              ) : (
                <Ionicons name="person" size={48} color="#2563eb" />
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={18} color="#2563eb" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/income')}
          >
            <Ionicons name="arrow-down" size={24} color="#10b981" />
            <Text style={styles.statValue}>{CURRENCY_SYMBOL}{stats.income.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/expense')}
          >
            <Ionicons name="arrow-up" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{CURRENCY_SYMBOL}{stats.expenses.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/budget')}
          >
            <Ionicons name="wallet" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{CURRENCY_SYMBOL}{stats.budget.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, item.color && { backgroundColor: `${item.color}20` }]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={item.color || '#6b7280'} 
                  />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    borderWidth: 3,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
  },
  editProfileText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
});
