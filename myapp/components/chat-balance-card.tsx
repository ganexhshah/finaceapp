import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Account {
  name: string;
  balance: number;
  type: string;
  icon?: string;
}

interface ChatBalanceCardProps {
  accounts: Account[];
  onAccountPress?: (account: Account) => void;
  onViewAllPress?: () => void;
}

export default function ChatBalanceCard({ accounts, onAccountPress, onViewAllPress }: ChatBalanceCardProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      case 'wallet':
        return 'wallet-outline';
      default:
        return 'wallet-outline';
    }
  };

  const getAccountColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank':
        return '#3b82f6';
      case 'cash':
        return '#10b981';
      case 'wallet':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Success Badge */}
      <View style={styles.successBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
        <Text style={styles.successText}>Balance Retrieved Successfully</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={20} color="#2563eb" />
        </View>
        <Text style={styles.title}>Account Balances</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>Rs. {totalBalance.toLocaleString()}</Text>
      </View>

      <View style={styles.accountsList}>
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={index}
            style={styles.accountItem}
            onPress={() => onAccountPress?.(account)}
            activeOpacity={0.7}
          >
            <View style={[styles.accountIcon, { backgroundColor: `${getAccountColor(account.type)}15` }]}>
              <Ionicons name={getAccountIcon(account.type) as any} size={18} color={getAccountColor(account.type)} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>{account.type}</Text>
            </View>
            <Text style={styles.accountBalance}>Rs. {account.balance.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Button */}
      {onViewAllPress && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onViewAllPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>View All Accounts</Text>
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  totalLabel: {
    fontSize: 13,
    color: '#3b82f6',
    marginBottom: 4,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e40af',
  },
  accountsList: {
    gap: 8,
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
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
