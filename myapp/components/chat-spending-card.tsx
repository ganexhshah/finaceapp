import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpendingData {
  totalIncome: number;
  totalExpense: number;
  net: number;
  topCategories?: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

interface ChatSpendingCardProps {
  data: SpendingData;
  period?: string;
  onViewDetailsPress?: () => void;
}

export default function ChatSpendingCard({ data, period = 'Last 30 Days', onViewDetailsPress }: ChatSpendingCardProps) {
  const { totalIncome, totalExpense, net, topCategories } = data;
  const isPositive = net >= 0;

  return (
    <View style={styles.container}>
      {/* Success Badge */}
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
        <Text style={styles.successText}>Analysis Complete</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={20} color="#8b5cf6" />
        </View>
        <Text style={styles.title}>Spending Analysis</Text>
      </View>

      <Text style={styles.period}>{period}</Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="arrow-down" size={16} color="#16a34a" />
          </View>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: '#16a34a' }]}>
            Rs. {totalIncome.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="arrow-up" size={16} color="#dc2626" />
          </View>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: '#dc2626' }]}>
            Rs. {totalExpense.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={[styles.netCard, isPositive ? styles.netPositive : styles.netNegative]}>
        <View style={styles.netHeader}>
          <Text style={styles.netLabel}>Net Balance</Text>
          <Ionicons 
            name={isPositive ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color={isPositive ? '#16a34a' : '#dc2626'} 
          />
        </View>
        <Text style={[styles.netAmount, { color: isPositive ? '#16a34a' : '#dc2626' }]}>
          {isPositive ? '+' : ''}Rs. {net.toLocaleString()}
        </Text>
      </View>

      {topCategories && topCategories.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Top Spending Categories</Text>
          {topCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>Rs. {category.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${category.percentage}%` }]} />
              </View>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Button */}
      {onViewDetailsPress && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onViewDetailsPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>View Statistics</Text>
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
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  period: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  netCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  netPositive: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  netNegative: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  netHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  netLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  netAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoriesSection: {
    marginTop: 4,
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
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
