import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import AddIncomeModal from '@/components/add-income-modal';
import IncomeDetailsModal from '@/components/income-details-modal';
import api from '@/lib/api';

export default function IncomeScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);
  const [incomeList, setIncomeList] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadIncomes = useCallback(async () => {
    try {
      const res = await api.getIncomes();
      if (res.success && res.data) {
        const data = res.data as any;
        const incomesList = data.incomes || [];
        const formattedIncomes = incomesList.map((income: any) => ({
          id: income.id,
          title: income.title,
          amount: income.amount,
          icon: income.category?.icon || 'wallet',
          date: new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: income.category?.name || 'Income',
          recurring: income.recurring || false,
        }));
        setIncomeList(formattedIncomes);
        
        const total = incomesList.reduce((sum: number, income: any) => sum + income.amount, 0);
        setTotalIncome(total);
      }
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIncomes();
    setRefreshing(false);
  }, [loadIncomes]);

  const handleIncomePress = (income: any) => {
    setSelectedIncome(income);
    setShowDetailsModal(true);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      const res = await api.deleteIncome(incomeId);
      if (res.success) {
        await loadIncomes();
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Income" showBack={true} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="arrow-down" size={32} color="#10b981" />
          </View>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryAmount}>
            {CURRENCY_SYMBOL}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.summaryPeriod}>This Month</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Income</Text>
            <Text style={styles.sectionCount}>{incomeList.length} entries</Text>
          </View>

          <View style={styles.incomeList}>
            {loading ? (
              <View style={{ paddingVertical: 24 }}>
                <ActivityIndicator color="#10b981" />
              </View>
            ) : incomeList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No income records yet</Text>
                <Text style={styles.emptySubtext}>Add your first income to get started</Text>
              </View>
            ) : incomeList.map((income) => (
              <TouchableOpacity 
                key={income.id} 
                style={styles.incomeItem}
                onPress={() => handleIncomePress(income)}
                activeOpacity={0.7}
              >
                <View style={styles.incomeIcon}>
                  <Ionicons name={income.icon as any} size={24} color="#10b981" />
                </View>

                <View style={styles.incomeDetails}>
                  <View style={styles.incomeHeader}>
                    <Text style={styles.incomeTitle}>{income.title}</Text>
                    {income.recurring && (
                      <View style={styles.recurringBadge}>
                        <Ionicons name="repeat" size={12} color="#10b981" />
                        <Text style={styles.recurringText}>Recurring</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.incomeMeta}>
                    <Text style={styles.incomeCategory}>{income.category}</Text>
                    <Text style={styles.incomeDot}>•</Text>
                    <Text style={styles.incomeDate}>{income.date}</Text>
                  </View>
                </View>

                <Text style={styles.incomeAmount}>
                  +{CURRENCY_SYMBOL}{income.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
          <Text style={styles.addButtonText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      <AddIncomeModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadIncomes}
      />

      <IncomeDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedIncome(null);
        }}
        income={selectedIncome}
        onUpdated={loadIncomes}
        onDeleted={loadIncomes}
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
    backgroundColor: '#d1fae5',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#10b981',
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
    color: '#047857',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryAmount: {
    fontSize: 36,
    color: '#065f46',
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  summaryPeriod: {
    fontSize: 13,
    color: '#059669',
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
  incomeList: {
    gap: 12,
  },
  incomeItem: {
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
  incomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeDetails: {
    flex: 1,
  },
  incomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  recurringText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  incomeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeCategory: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  incomeDot: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  incomeDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
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
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10b981',
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
