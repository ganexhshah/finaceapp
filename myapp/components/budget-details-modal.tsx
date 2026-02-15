import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';

interface BudgetDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  budget: any;
  onUpdated?: () => void;
}

export default function BudgetDetailsModal({ visible, onClose, budget, onUpdated }: BudgetDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as any });

  useEffect(() => {
    if (visible && budget) {
      setAmount(budget.amount.toString());
      loadTransactions();
    }
  }, [visible, budget]);

  const loadTransactions = async () => {
    if (!budget) return;
    
    setLoading(true);
    try {
      const res = await api.getExpenses({
        categoryId: budget.categoryId,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });

      if (res.success && res.data) {
        const expensesData = res.data as any;
        const expensesList = expensesData.expenses || [];
        setTransactions(expensesList);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      setAlertConfig({ title: 'Validation Error', message: 'Amount must be a positive number', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      // Update budget by creating a new one with same category and period
      const res = await api.createBudget({
        categoryId: budget.categoryId,
        amount: amt,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to update budget', type: 'error' });
        setShowAlert(true);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Budget updated successfully!', type: 'success' });
      setShowAlert(true);
      setIsEditing(false);
      
      setTimeout(() => {
        setShowAlert(false);
        onUpdated?.();
      }, 1500);
    } catch (e) {
      console.error('Budget update error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while updating the budget', type: 'error' });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  if (!budget) return null;

  const spent = budget.spent || 0;
  const percentage = budget.percentage || 0;
  const remaining = budget.remaining || (budget.amount - spent);
  const isOverBudget = remaining < 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Budget Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Info */}
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: `${budget.category?.color || '#f59e0b'}20` }]}>
                <Ionicons 
                  name={(budget.category?.icon || 'pricetag') as any} 
                  size={32} 
                  color={budget.category?.color || '#f59e0b'} 
                />
              </View>
              <Text style={styles.categoryName}>{budget.category?.name || 'Category'}</Text>
              <Text style={styles.periodText}>{budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget</Text>
            </View>

            {/* Budget Amount */}
            <View style={styles.amountSection}>
              {isEditing ? (
                <View style={styles.editAmountContainer}>
                  <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.amountLabel}>Budget Amount</Text>
                  <Text style={styles.amountValue}>
                    {CURRENCY_SYMBOL}{budget.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </>
              )}
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage)
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>{percentage}% Used</Text>
                <Text style={[styles.progressText, isOverBudget && styles.overBudgetText]}>
                  {isOverBudget ? 'Over Budget!' : `${100 - percentage}% Left`}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Spent</Text>
                <Text style={[styles.statValue, styles.spentValue]}>
                  {CURRENCY_SYMBOL}{spent.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={[styles.statValue, isOverBudget ? styles.overValue : styles.remainingValue]}>
                  {CURRENCY_SYMBOL}{Math.abs(remaining).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Transactions */}
            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>Transactions ({transactions.length})</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#f59e0b" />
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionLeft}>
                        <View style={styles.transactionIcon}>
                          <Ionicons name="arrow-up" size={16} color="#ef4444" />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text style={styles.transactionTitle}>{transaction.title}</Text>
                          <Text style={styles.transactionDate}>
                            {new Date(transaction.date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.transactionAmount}>
                        -{CURRENCY_SYMBOL}{transaction.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setIsEditing(false);
                    setAmount(budget.amount.toString());
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Update Budget</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color="#ffffff" />
                <Text style={styles.editButtonText}>Edit Budget</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Alert
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  content: {
    padding: 20,
  },
  categorySection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  periodText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f59e0b',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  editAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f59e0b',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f59e0b',
    minWidth: 150,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
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
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  overBudgetText: {
    color: '#ef4444',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  spentValue: {
    color: '#ef4444',
  },
  remainingValue: {
    color: '#10b981',
  },
  overValue: {
    color: '#ef4444',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    gap: 8,
  },
  editButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
