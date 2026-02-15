import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import AddExpenseModal from '@/components/add-expense-modal';
import ExpenseDetailsModal from '@/components/expense-details-modal';
import api from '@/lib/api';

export default function ExpenseScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      const res = await api.getExpenses();
      if (res.success && res.data) {
        const data = res.data as any;
        const expensesList = data.expenses || [];
        const formattedExpenses = expensesList.map((expense: any) => ({
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          icon: expense.category?.icon || 'cart',
          date: new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: expense.category?.name || 'Expense',
          recurring: expense.recurring || false,
        }));
        setExpenseList(formattedExpenses);
        
        const total = expensesList.reduce((sum: number, expense: any) => sum + expense.amount, 0);
        setTotalExpense(total);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  const handleExpensePress = (expense: any) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const res = await api.deleteExpense(expenseId);
      if (res.success) {
        await loadExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Expenses" showBack={true} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="arrow-up" size={32} color="#ef4444" />
          </View>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>
            {CURRENCY_SYMBOL}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.summaryPeriod}>This Month</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Expenses</Text>
            <Text style={styles.sectionCount}>{expenseList.length} entries</Text>
          </View>

          <View style={styles.expenseList}>
            {loading ? (
              <View style={{ paddingVertical: 24 }}>
                <ActivityIndicator color="#ef4444" />
              </View>
            ) : expenseList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No expense records yet</Text>
                <Text style={styles.emptySubtext}>Add your first expense to get started</Text>
              </View>
            ) : expenseList.map((expense) => (
              <TouchableOpacity 
                key={expense.id} 
                style={styles.expenseItem}
                onPress={() => handleExpensePress(expense)}
                activeOpacity={0.7}
              >
                <View style={styles.expenseIcon}>
                  <Ionicons name={expense.icon as any} size={24} color="#ef4444" />
                </View>

                <View style={styles.expenseDetails}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    {expense.recurring && (
                      <View style={styles.recurringBadge}>
                        <Ionicons name="repeat" size={12} color="#ef4444" />
                        <Text style={styles.recurringText}>Recurring</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.expenseMeta}>
                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                    <Text style={styles.expenseDot}>•</Text>
                    <Text style={styles.expenseDate}>{expense.date}</Text>
                  </View>
                </View>

                <Text style={styles.expenseAmount}>
                  -{CURRENCY_SYMBOL}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <AddExpenseModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadExpenses}
      />

      <ExpenseDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdated={loadExpenses}
        onDeleted={loadExpenses}
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
  summaryCard: {
    backgroundColor: '#fee2e2',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#b91c1c',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryAmount: {
    fontSize: 36,
    color: '#991b1b',
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryPeriod: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
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
  sectionCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  expenseList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  recurringText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  expenseDot: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  expenseDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
