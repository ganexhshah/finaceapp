import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Budget {
  category: string;
  spent: number;
  limit: number;
}

interface ChatBudgetCardProps {
  budgets: Budget[];
  onManageBudgetsPress?: () => void;
}

export default function ChatBudgetCard({ budgets, onManageBudgetsPress }: ChatBudgetCardProps) {
  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (spent > limit) return { status: 'exceeded', color: '#dc2626', icon: 'alert-circle' };
    if (percentage > 80) return { status: 'warning', color: '#f59e0b', icon: 'warning' };
    return { status: 'ok', color: '#16a34a', icon: 'checkmark-circle' };
  };

  return (
    <View style={styles.container}>
      {/* Success Badge */}
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
        <Text style={styles.successText}>Budget Status Retrieved</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="pie-chart" size={20} color="#f59e0b" />
        </View>
        <Text style={styles.title}>Budget Status</Text>
      </View>

      <View style={styles.budgetsList}>
        {budgets.map((budget, index) => {
          const percentage = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
          const { status, color, icon } = getBudgetStatus(budget.spent, budget.limit);

          return (
            <View key={index} style={styles.budgetItem}>
              <View style={styles.budgetHeader}>
                <Text style={styles.categoryName}>{budget.category}</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name={icon as any} size={14} color={color} />
                  <Text style={[styles.statusText, { color }]}>
                    {status === 'exceeded' ? 'Over' : status === 'warning' ? 'Warning' : 'OK'}
                  </Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.spentAmount}>Rs. {budget.spent.toLocaleString()}</Text>
                <Text style={styles.limitAmount}>/ Rs. {budget.limit.toLocaleString()}</Text>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }
                  ]} 
                />
              </View>

              <Text style={[styles.percentageText, { color }]}>
                {percentage.toFixed(0)}% used
              </Text>
            </View>
          );
        })}
      </View>

      {budgets.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="information-circle-outline" size={32} color="#9ca3af" />
          <Text style={styles.emptyText}>No active budgets</Text>
        </View>
      )}

      {/* Action Button */}
      {onManageBudgetsPress && budgets.length > 0 && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onManageBudgetsPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Manage Budgets</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  budgetsList: {
    gap: 16,
    marginBottom: 12,
  },
  budgetItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  limitAmount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
