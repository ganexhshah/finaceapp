import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import SetBudgetModal from '@/components/set-budget-modal';
import BudgetDetailsModal from '@/components/budget-details-modal';
import api from '@/lib/api';

export default function BudgetScreen() {
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBudgets = useCallback(async () => {
    try {
      const budgetsRes = await api.getBudgets();

      if (budgetsRes.success && budgetsRes.data) {
        // Backend returns array directly, not nested
        const budgetsArray = Array.isArray(budgetsRes.data) ? budgetsRes.data : [];
        console.log('Loaded budgets:', budgetsArray);
        setBudgets(budgetsArray);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  }, [loadBudgets]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  const handleBudgetPress = (budget: any) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Budget" showBack={true} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : (
          <>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>Monthly Budget</Text>
              <Text style={styles.summaryAmount}>
                {CURRENCY_SYMBOL}{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="wallet" size={32} color="#f59e0b" />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(percentageUsed, 100)}%`,
                    backgroundColor: getProgressColor(percentageUsed)
                  }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                Spent: {CURRENCY_SYMBOL}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.progressPercentage}>{percentageUsed.toFixed(1)}%</Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, styles.remainingValue]}>
                {CURRENCY_SYMBOL}{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, styles.spentValue]}>
                {CURRENCY_SYMBOL}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Budgets</Text>
            <Text style={styles.sectionCount}>{budgets.length} categories</Text>
          </View>

          <View style={styles.budgetList}>
            {budgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No budgets set yet</Text>
                <Text style={styles.emptySubtext}>Set your first budget to track spending</Text>
              </View>
            ) : budgets.map((budget) => {
              const spent = budget.spent || 0;
              const percentage = budget.percentage || 0;
              const remaining = budget.remaining || (budget.amount - spent);
              return (
                <TouchableOpacity 
                  key={budget.id} 
                  style={styles.budgetItem}
                  onPress={() => handleBudgetPress(budget)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.budgetIcon, { backgroundColor: `${budget.category?.color || '#f59e0b'}20` }]}>
                    <Ionicons name={(budget.category?.icon || 'pricetag') as any} size={24} color={budget.category?.color || '#f59e0b'} />
                  </View>

                  <View style={styles.budgetDetails}>
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetCategory}>{budget.category?.name || 'Category'}</Text>
                      <Text style={styles.budgetAmount}>
                        {CURRENCY_SYMBOL}{budget.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    <View style={styles.budgetProgressBar}>
                      <View 
                        style={[
                          styles.budgetProgressFill, 
                          { 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: getProgressColor(percentage)
                          }
                        ]} 
                      />
                    </View>

                    <View style={styles.budgetFooter}>
                      <Text style={styles.budgetSpent}>
                        Spent: {CURRENCY_SYMBOL}{spent.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[
                        styles.budgetRemaining,
                        percentage >= 90 && styles.budgetWarning
                      ]}>
                        {remaining >= 0 ? 'Left: ' : 'Over: '}
                        {CURRENCY_SYMBOL}{Math.abs(remaining).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
        </>
        )}
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowSetBudgetModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Set New Budget</Text>
        </TouchableOpacity>
      </View>

      <SetBudgetModal 
        visible={showSetBudgetModal}
        onClose={() => setShowSetBudgetModal(false)}
        onSaved={loadBudgets}
      />

      <BudgetDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        onUpdated={loadBudgets}
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
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryAmount: {
    fontSize: 32,
    color: '#78350f',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#fde68a',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  progressPercentage: {
    fontSize: 13,
    color: '#78350f',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#fbbf24',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  remainingValue: {
    color: '#10b981',
  },
  spentValue: {
    color: '#ef4444',
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
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  budgetAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  budgetProgressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSpent: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  budgetRemaining: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  budgetWarning: {
    color: '#ef4444',
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
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f59e0b',
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
});
