import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/header';
import BalanceCard from '@/components/balance-card';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import { SkeletonBalanceCard, SkeletonTransactionList, SkeletonCard } from '@/components/skeleton';

export default function DashboardScreen() {
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [incomesRes, expensesRes, partiesRes, accountsRes] = await Promise.all([
        api.getIncomes(),
        api.getExpenses(),
        api.getParties(),
        api.getAccounts(),
      ]);

      // Calculate totals
      let incomeTotal = 0;
      let expensesTotal = 0;

      // Combine and sort recent transactions
      const allTransactions: any[] = [];
      
      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        incomeTotal = incomesList.reduce((sum: number, item: any) => sum + item.amount, 0);
        
        incomesList.slice(0, 2).forEach((income: any) => {
          allTransactions.push({
            id: `income-${income.id}`,
            title: income.title,
            amount: income.amount,
            type: 'income',
            icon: income.category?.icon || 'wallet',
            date: new Date(income.date).toLocaleDateString(),
          });
        });
      }

      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        expensesTotal = expensesList.reduce((sum: number, item: any) => sum + item.amount, 0);
        
        expensesList.slice(0, 2).forEach((expense: any) => {
          allTransactions.push({
            id: `expense-${expense.id}`,
            title: expense.title,
            amount: -expense.amount,
            type: 'expense',
            icon: expense.category?.icon || 'cart',
            date: new Date(expense.date).toLocaleDateString(),
          });
        });
      }

      setTotalIncome(incomeTotal);
      setTotalExpenses(expensesTotal);
      setTransactions(allTransactions.slice(0, 4));

      if (partiesRes.success && partiesRes.data) {
        // Backend returns { parties: [], summary: {} }
        const partiesData = partiesRes.data.parties || partiesRes.data;
        setParties(Array.isArray(partiesData) ? partiesData : []);
      }

      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        setAccounts(accountsData.accounts || []);
        setTotalBalance(accountsData.totalBalance || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const totalReceive = parties.filter((p: any) => p.type === 'receive').reduce((sum: number, p: any) => sum + (p.balance || 0), 0);
  const totalGive = parties.filter((p: any) => p.type === 'give').reduce((sum: number, p: any) => sum + (p.balance || 0), 0);

  const cashAccount = accounts.find((a: any) => a.type === 'cash');
  const bankAccount = accounts.find((a: any) => a.type === 'bank');

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <>
            <SkeletonBalanceCard />
            <View style={styles.quickActions}>
              <View style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]} />
                <View style={{ width: 60, height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, marginTop: 8 }} />
              </View>
              <View style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]} />
                <View style={{ width: 60, height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, marginTop: 8 }} />
              </View>
              <View style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]} />
                <View style={{ width: 60, height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, marginTop: 8 }} />
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ width: 150, height: 18, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
                <View style={{ width: 60, height: 14, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
              </View>
              <SkeletonTransactionList count={4} />
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ width: 120, height: 18, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
                <View style={{ width: 60, height: 14, backgroundColor: '#e5e7eb', borderRadius: 6 }} />
              </View>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </>
        ) : (
          <>
        <BalanceCard 
          balance={totalBalance}
          income={totalIncome}
          expenses={totalExpenses}
        />

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/income')}
          >
            <View style={[styles.actionIcon, styles.incomeIcon]}>
              <Ionicons name="add" size={20} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/expense')}
          >
            <View style={[styles.actionIcon, styles.expenseIcon]}>
              <Ionicons name="remove" size={20} color="#ef4444" />
            </View>
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/budget')}
          >
            <View style={[styles.actionIcon, styles.budgetIcon]}>
              <Ionicons name="wallet" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Set Budget</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                  <View style={[
                    styles.transactionIcon,
                    transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                  ]}>
                    <Ionicons 
                      name={transaction.icon as any} 
                      size={20} 
                      color={transaction.type === 'income' ? '#10b981' : '#ef4444'} 
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>

                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parties</Text>
            <TouchableOpacity onPress={() => router.push('/parties')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.partiesList}>
            <TouchableOpacity 
              style={styles.partyCard}
              onPress={() => router.push('/parties')}
            >
              <View style={styles.partyCardIcon}>
                <Ionicons name="arrow-down" size={20} color="#10b981" />
              </View>
              <Text style={styles.partyCardLabel}>To Receive</Text>
              <Text style={[styles.partyCardAmount, styles.receiveAmount]}>
                {CURRENCY_SYMBOL}{totalReceive.toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.partyCard}
              onPress={() => router.push('/parties')}
            >
              <View style={styles.partyCardIcon}>
                <Ionicons name="arrow-up" size={20} color="#ef4444" />
              </View>
              <Text style={styles.partyCardLabel}>To Give</Text>
              <Text style={[styles.partyCardAmount, styles.giveAmount]}>
                {CURRENCY_SYMBOL}{totalGive.toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accounts</Text>
            <TouchableOpacity onPress={() => router.push('/accounts')}>
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountsList}>
            {cashAccount && (
              <TouchableOpacity 
                style={styles.accountCard}
                onPress={() => router.push({ pathname: '/account-details', params: { id: String(cashAccount.id) } })}
              >
                <View style={[styles.accountCardIcon, { backgroundColor: `${cashAccount.color}20` }]}>
                  <Ionicons name={cashAccount.icon as any} size={24} color={cashAccount.color} />
                </View>
                <View style={styles.accountCardDetails}>
                  <Text style={styles.accountCardLabel}>{cashAccount.name}</Text>
                  <Text style={styles.accountCardAmount}>
                    {CURRENCY_SYMBOL}{cashAccount.balance.toLocaleString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {bankAccount && (
              <TouchableOpacity 
                style={styles.accountCard}
                onPress={() => router.push({ pathname: '/account-details', params: { id: String(bankAccount.id) } })}
              >
                <View style={[styles.accountCardIcon, { backgroundColor: `${bankAccount.color}20` }]}>
                  <Ionicons name={bankAccount.icon as any} size={24} color={bankAccount.color} />
                </View>
                <View style={styles.accountCardDetails}>
                  <Text style={styles.accountCardLabel}>{bankAccount.name}</Text>
                  <Text style={styles.accountCardAmount}>
                    {CURRENCY_SYMBOL}{bankAccount.balance.toLocaleString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeIcon: {
    backgroundColor: '#d1fae5',
  },
  expenseIcon: {
    backgroundColor: '#fee2e2',
  },
  budgetIcon: {
    backgroundColor: '#fef3c7',
  },
  actionText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  partiesList: {
    flexDirection: 'row',
    gap: 12,
  },
  partyCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  partyCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyCardAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  receiveAmount: {
    color: '#10b981',
  },
  giveAmount: {
    color: '#ef4444',
  },
  accountsList: {
    flexDirection: 'row',
    gap: 12,
  },
  accountCard: {
    flex: 1,
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
  accountCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountCardDetails: {
    flex: 1,
  },
  accountCardLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountCardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
});
