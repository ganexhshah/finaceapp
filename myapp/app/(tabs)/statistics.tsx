import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';

export default function StatisticsScreen() {
  const router = useRouter();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatistics = useCallback(async () => {
    try {
      // Get current month date range
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const lastDayCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

      // Get previous month for comparison
      const firstDayPrevMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayPrevMonth = new Date(currentYear, currentMonth, 0);

      const [
        currentMonthIncome,
        currentMonthExpense,
        prevMonthIncome,
        prevMonthExpense,
      ] = await Promise.all([
        api.getIncomes({
          startDate: firstDayCurrentMonth.toISOString(),
          endDate: lastDayCurrentMonth.toISOString(),
        }),
        api.getExpenses({
          startDate: firstDayCurrentMonth.toISOString(),
          endDate: lastDayCurrentMonth.toISOString(),
        }),
        api.getIncomes({
          startDate: firstDayPrevMonth.toISOString(),
          endDate: lastDayPrevMonth.toISOString(),
        }),
        api.getExpenses({
          startDate: firstDayPrevMonth.toISOString(),
          endDate: lastDayPrevMonth.toISOString(),
        }),
      ]);

      // Calculate current month totals
      let incomeTotal = 0;
      let expenseTotal = 0;

      if (currentMonthIncome.success && currentMonthIncome.data) {
        const incomesData = currentMonthIncome.data as any;
        const incomesList = incomesData.incomes || [];
        incomeTotal = incomesList.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      if (currentMonthExpense.success && currentMonthExpense.data) {
        const expensesData = currentMonthExpense.data as any;
        const expensesList = expensesData.expenses || [];
        expenseTotal = expensesList.reduce((sum: number, item: any) => sum + item.amount, 0);

        // Calculate category breakdown
        const categoryMap = new Map<string, { amount: number; icon: string; color: string }>();
        
        expensesList.forEach((expense: any) => {
          const categoryName = expense.category?.name || 'Other';
          const categoryIcon = expense.category?.icon || 'pricetag';
          const categoryColor = expense.category?.color || '#6b7280';
          
          if (categoryMap.has(categoryName)) {
            const existing = categoryMap.get(categoryName)!;
            existing.amount += expense.amount;
          } else {
            categoryMap.set(categoryName, {
              amount: expense.amount,
              icon: categoryIcon,
              color: categoryColor,
            });
          }
        });

        // Convert to array and calculate percentages
        const categories = Array.from(categoryMap.entries())
          .map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: expenseTotal > 0 ? (data.amount / expenseTotal) * 100 : 0,
            icon: data.icon,
            color: data.color,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5); // Top 5 categories

        setCategoryData(categories);
      }

      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);

      // Calculate previous month totals
      let prevIncomeTotal = 0;
      let prevExpenseTotal = 0;

      if (prevMonthIncome.success && prevMonthIncome.data) {
        const incomesData = prevMonthIncome.data as any;
        const incomesList = incomesData.incomes || [];
        prevIncomeTotal = incomesList.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      if (prevMonthExpense.success && prevMonthExpense.data) {
        const expensesData = prevMonthExpense.data as any;
        const expensesList = expensesData.expenses || [];
        prevExpenseTotal = expensesList.reduce((sum: number, item: any) => sum + item.amount, 0);
      }

      // Set monthly comparison data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthly = [
        {
          month: monthNames[currentMonth - 1] || monthNames[11],
          income: prevIncomeTotal,
          expense: prevExpenseTotal,
        },
        {
          month: monthNames[currentMonth],
          income: incomeTotal,
          expense: expenseTotal,
        },
      ];

      setMonthlyData(monthly);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  }, [loadStatistics]);

  const netBalance = totalIncome - totalExpense;
  const maxAmount = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);

  return (
    <View style={styles.container}>
      <PageHeader title="Statistics" rightIcon="calendar-outline" />
      
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
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.incomeCard]}
            onPress={() => router.push('/income')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-down" size={24} color="#10b981" />
            </View>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={[styles.cardAmount, styles.incomeAmount]}>
              {CURRENCY_SYMBOL}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.summaryCard, styles.expenseCard]}
            onPress={() => router.push('/expense')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-up" size={24} color="#ef4444" />
            </View>
            <Text style={styles.cardLabel}>Total Expense</Text>
            <Text style={[styles.cardAmount, styles.expenseAmount]}>
              {CURRENCY_SYMBOL}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Net Balance */}
        <View style={styles.netBalanceCard}>
          <View style={styles.netBalanceHeader}>
            <Text style={styles.netBalanceLabel}>Net Balance</Text>
            <View style={styles.netBalanceIcon}>
              <Ionicons name="wallet" size={28} color="#2563eb" />
            </View>
          </View>
          <Text style={styles.netBalanceAmount}>
            {CURRENCY_SYMBOL}{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.netBalanceSubtext}>This Month</Text>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense by Category</Text>
          {categoryData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No expense data yet</Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {categoryData.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <Ionicons name={category.icon as any} size={20} color={category.color} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {CURRENCY_SYMBOL}{category.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Monthly Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Comparison</Text>
          {monthlyData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No monthly data yet</Text>
            </View>
          ) : (
            <View style={styles.monthlyList}>
              {monthlyData.map((data, index) => (
                <View key={index} style={styles.monthlyItem}>
                  <Text style={styles.monthLabel}>{data.month}</Text>
                  <View style={styles.monthlyBars}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, styles.incomeBar, { width: `${(data.income / maxAmount) * 100}%` }]} />
                      <Text style={styles.barLabel}>
                        Income: {CURRENCY_SYMBOL}{data.income.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, styles.expenseBar, { width: `${(data.expense / maxAmount) * 100}%` }]} />
                      <Text style={styles.barLabel}>
                        Expense: {CURRENCY_SYMBOL}{data.expense.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/income')}
          >
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={styles.actionText}>View Income</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/expense')}
          >
            <Ionicons name="trending-down" size={24} color="#ef4444" />
            <Text style={styles.actionText}>View Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/budget')}
          >
            <Ionicons name="wallet" size={24} color="#f59e0b" />
            <Text style={styles.actionText}>View Budget</Text>
          </TouchableOpacity>
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
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#d1fae5',
  },
  expenseCard: {
    backgroundColor: '#fee2e2',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  incomeAmount: {
    color: '#065f46',
  },
  expenseAmount: {
    color: '#991b1b',
  },
  netBalanceCard: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  netBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  netBalanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netBalanceAmount: {
    fontSize: 32,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  netBalanceSubtext: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  monthlyList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthlyItem: {
    gap: 12,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  monthlyBars: {
    gap: 8,
  },
  barContainer: {
    gap: 4,
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  incomeBar: {
    backgroundColor: '#10b981',
  },
  expenseBar: {
    backgroundColor: '#ef4444',
  },
  barLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  actionCard: {
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
  actionText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
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
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
});

