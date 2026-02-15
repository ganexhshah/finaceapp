import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import TransactionDetailsModal from '@/components/transaction-details-modal';
import { SkeletonStatCard, SkeletonTransactionList } from '@/components/skeleton';

export default function TransactionsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState('February 2026');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Backend integration
  const [transactions, setTransactions] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const [incomesRes, expensesRes] = await Promise.all([
        api.getIncomes(),
        api.getExpenses(),
      ]);

      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        setIncomes(incomesData.incomes || []);
      }

      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        setExpenses(expensesData.expenses || []);
      }

      // Combine and format transactions
      const allTransactions: any[] = [];
      
      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        incomesList.forEach((income: any) => {
          allTransactions.push({
            id: `income-${income.id}`,
            originalId: income.id,
            title: income.title,
            category: income.category?.name || 'Income',
            amount: income.amount,
            type: 'income',
            icon: income.category?.icon || 'wallet',
            date: new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            time: new Date(income.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(income.date).getTime(),
            notes: income.notes,
          });
        });
      }

      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        expensesList.forEach((expense: any) => {
          allTransactions.push({
            id: `expense-${expense.id}`,
            originalId: expense.id,
            title: expense.title,
            category: expense.category?.name || 'Expense',
            amount: -expense.amount,
            type: 'expense',
            icon: expense.category?.icon || 'cart',
            date: new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            time: new Date(expense.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(expense.date).getTime(),
            notes: expense.notes,
          });
        });
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const months = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const categories = ['All', 'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

  const filteredTransactions = transactions.filter(t => {
    if (selectedFilter === 'all') return true;
    return t.type === selectedFilter;
  });

  const handleAddIncome = () => {
    console.log('Add Income clicked');
    router.push('/income');
  };

  const handleAddExpense = () => {
    console.log('Add Expense clicked');
    router.push('/expense');
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setShowCalendar(false);
    console.log('Selected month:', month);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    console.log('Applied filters:', { category: selectedCategory, sortBy });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSortBy('date');
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Transactions" />
      
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
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/income')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, styles.incomeIcon]}>
              <Ionicons name="arrow-down" size={20} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>{CURRENCY_SYMBOL}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/expense')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, styles.expenseIcon]}>
              <Ionicons name="arrow-up" size={20} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>{CURRENCY_SYMBOL}{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.balanceIcon]}>
              <Ionicons name="wallet" size={20} color="#2563eb" />
            </View>
            <Text style={styles.statLabel}>Net Balance</Text>
            <Text style={[styles.statAmount, styles.balanceAmount]}>{CURRENCY_SYMBOL}{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#2563eb" />
            <Text style={styles.calendarText}>{selectedMonth}</Text>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter-outline" size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity 
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, selectedFilter === 'income' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('income')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'income' && styles.filterTabTextActive]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, selectedFilter === 'expense' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('expense')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'expense' && styles.filterTabTextActive]}>
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.id} 
              style={styles.transactionItem}
              onPress={() => {
                setSelectedTransaction(transaction);
                setShowDetailsModal(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.transactionIcon,
                transaction.type === 'income' ? styles.transactionIncomeIcon : styles.transactionExpenseIcon
              ]}>
                <Ionicons 
                  name={transaction.icon as any} 
                  size={20} 
                  color={transaction.type === 'income' ? '#10b981' : '#ef4444'} 
                />
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDot}>•</Text>
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
              </View>

              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.transactionIncomeAmount : styles.transactionExpenseAmount
                ]}>
                  {transaction.amount > 0 ? '+' : ''}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
        </>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.incomeButton]}
          onPress={handleAddIncome}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.actionButtonText}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.expenseButton]}
          onPress={handleAddExpense}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={18} color="#ffffff" />
          <Text style={styles.actionButtonText}>Expense</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthItem,
                    selectedMonth === month && styles.monthItemActive
                  ]}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text style={[
                    styles.monthText,
                    selectedMonth === month && styles.monthTextActive
                  ]}>
                    {month}
                  </Text>
                  {selectedMonth === month && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category.toLowerCase() && styles.categoryChipActive
                      ]}
                      onPress={() => setSelectedCategory(category.toLowerCase())}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        selectedCategory === category.toLowerCase() && styles.categoryChipTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'date' && styles.sortOptionActive]}
                  onPress={() => setSortBy('date')}
                >
                  <Ionicons name="calendar-outline" size={20} color={sortBy === 'date' ? '#2563eb' : '#6b7280'} />
                  <Text style={[styles.sortOptionText, sortBy === 'date' && styles.sortOptionTextActive]}>
                    Date
                  </Text>
                  {sortBy === 'date' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'amount' && styles.sortOptionActive]}
                  onPress={() => setSortBy('amount')}
                >
                  <Ionicons name="cash-outline" size={20} color={sortBy === 'amount' ? '#2563eb' : '#6b7280'} />
                  <Text style={[styles.sortOptionText, sortBy === 'amount' && styles.sortOptionTextActive]}>
                    Amount
                  </Text>
                  {sortBy === 'amount' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'category' && styles.sortOptionActive]}
                  onPress={() => setSortBy('category')}
                >
                  <Ionicons name="pricetag-outline" size={20} color={sortBy === 'category' ? '#2563eb' : '#6b7280'} />
                  <Text style={[styles.sortOptionText, sortBy === 'category' && styles.sortOptionTextActive]}>
                    Category
                  </Text>
                  {sortBy === 'category' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <TransactionDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onUpdated={loadTransactions}
        onDeleted={loadTransactions}
      />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  balanceIcon: {
    backgroundColor: '#dbeafe',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statAmount: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  balanceAmount: {
    color: '#2563eb',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  calendarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIncomeIcon: {
    backgroundColor: '#d1fae5',
  },
  transactionExpenseIcon: {
    backgroundColor: '#fee2e2',
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
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionDot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionIncomeAmount: {
    color: '#10b981',
  },
  transactionExpenseAmount: {
    color: '#ef4444',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeButton: {
    backgroundColor: '#10b981',
  },
  expenseButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  monthList: {
    padding: 12,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  monthItemActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  monthText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  monthTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  filterModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '80%',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryChipTextActive: {
    color: '#2563eb',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    gap: 12,
  },
  sortOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  sortOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
