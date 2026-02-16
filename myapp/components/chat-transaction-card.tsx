import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseDetailsModal from './expense-details-modal';
import IncomeDetailsModal from './income-details-modal';

interface ChatTransactionCardProps {
  type: 'expense' | 'income';
  data: {
    id: string;
    title: string;
    amount: number;
    category?: {
      name: string;
      icon: string;
    };
    account?: {
      name: string;
    };
    date: string;
  };
  onUpdate?: () => void;
}

export default function ChatTransactionCard({ type, data, onUpdate }: ChatTransactionCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isExpense = type === 'expense';
  const icon = isExpense ? 'arrow-down-circle' : 'arrow-up-circle';
  const color = isExpense ? '#ef4444' : '#10b981';
  const bgColor = isExpense ? '#fef2f2' : '#f0fdf4';

  return (
    <>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.category}>
              {data.category?.name || 'Other'} • {data.account?.name || 'Account'}
            </Text>
          </View>
          <Text style={[styles.amount, { color }]}>
            Rs. {data.amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowDetailsModal(true)}
          >
            <Ionicons name="eye-outline" size={18} color="#6b7280" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowDetailsModal(true)}
          >
            <Ionicons name="create-outline" size={18} color="#6b7280" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isExpense ? (
        <ExpenseDetailsModal
          visible={showDetailsModal}
          expense={data as any}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={() => {
            setShowDetailsModal(false);
            onUpdate?.();
          }}
        />
      ) : (
        <IncomeDetailsModal
          visible={showDetailsModal}
          income={data as any}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={() => {
            setShowDetailsModal(false);
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});
