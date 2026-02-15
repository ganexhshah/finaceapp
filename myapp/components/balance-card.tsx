import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import { useRouter } from 'expo-router';
import api from '@/lib/api';

interface BalanceCardProps {
  balance?: number;
  income?: number;
  expenses?: number;
  onRefresh?: () => void;
}

export default function BalanceCard({ 
  balance: propBalance, 
  income: propIncome,
  expenses: propExpenses,
  onRefresh,
}: BalanceCardProps) {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(propBalance || 0);
  const [income, setIncome] = useState(propIncome || 0);
  const [expenses, setExpenses] = useState(propExpenses || 0);

  const loadBalanceData = useCallback(async () => {
    // If props are provided, use them instead of fetching
    if (propBalance !== undefined && propIncome !== undefined && propExpenses !== undefined) {
      setBalance(propBalance);
      setIncome(propIncome);
      setExpenses(propExpenses);
      return;
    }

    setLoading(true);
    try {
      // Get current month date range
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const [incomesRes, expensesRes, accountsRes] = await Promise.all([
        api.getIncomes({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        }),
        api.getExpenses({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        }),
        api.getAccounts(),
      ]);

      let totalIncome = 0;
      let totalExpenses = 0;
      let totalBalance = 0;

      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        totalIncome = incomesList.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        totalExpenses = expensesList.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        totalBalance = accountsData.totalBalance || 0;
      }

      setBalance(totalBalance);
      setIncome(totalIncome);
      setExpenses(totalExpenses);
    } catch (error) {
      console.error('Error loading balance data:', error);
    } finally {
      setLoading(false);
    }
  }, [propBalance, propIncome, propExpenses]);

  useEffect(() => {
    loadBalanceData();
  }, [loadBalanceData]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        <View style={styles.headerActions}>
          {loading && <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 12 }} />}
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.currency}>{CURRENCY_SYMBOL}</Text>
        <Text style={styles.balance}>
          {showBalance ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '••••••'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => router.push('/income')}
          activeOpacity={0.7}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="arrow-down" size={16} color="#10b981" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>
              {showBalance ? `${CURRENCY_SYMBOL}${income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => router.push('/expense')}
          activeOpacity={0.7}
        >
          <View style={[styles.statIconContainer, styles.expenseIconContainer]}>
            <Ionicons name="arrow-up" size={16} color="#ef4444" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>
              {showBalance ? `${CURRENCY_SYMBOL}${expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  currency: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '700',
    marginRight: 4,
    marginTop: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  balance: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expenseIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#bfdbfe',
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statAmount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
});
