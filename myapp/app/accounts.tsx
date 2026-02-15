import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import AddAccountModal from '@/components/add-account-modal';
import api from '@/lib/api';

export default function AccountsScreen() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.getAccounts();
      if (res.success && res.data) {
        const data = res.data as any;
        setAccounts(data.accounts || []);
        setTotalBalance(data.totalBalance ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccounts();
    setRefreshing(false);
  }, [loadAccounts]);

  return (
    <View style={styles.container}>
      <PageHeader title="Cash & Bank" showBack={true} />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overall Balance */}
        <View style={styles.overallCard}>
          <View style={styles.overallIcon}>
            <Ionicons name="wallet" size={32} color="#2563eb" />
          </View>
          <Text style={styles.overallLabel}>Overall Account Balance</Text>
          <Text style={styles.overallAmount}>
            {CURRENCY_SYMBOL}{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.overallSubtext}>{accounts.length} Accounts</Text>
        </View>

        {/* Accounts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Accounts</Text>
          <View style={styles.accountsList}>
            {loading ? (
              <View style={{ paddingVertical: 24 }}>
                <ActivityIndicator color="#2563eb" />
              </View>
            ) : accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountItem}
                onPress={() => router.push({ pathname: '/account-details', params: { id: String(account.id) } })}
                activeOpacity={0.7}
              >
                <View style={[styles.accountIcon, { backgroundColor: `${account.color}20` }]}>
                  <Ionicons name={account.icon as any} size={24} color={account.color} />
                </View>

                <View style={styles.accountDetails}>
                  <View style={styles.accountHeader}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    {account.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  {account.accountNumber && (
                    <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                  )}
                  <Text style={styles.accountType}>{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</Text>
                </View>

                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>
                    {CURRENCY_SYMBOL}{account.balance.toLocaleString('en-IN')}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
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
          <Text style={styles.addButtonText}>Add New Account</Text>
        </TouchableOpacity>
      </View>

      <AddAccountModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadAccounts}
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
  overallCard: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  overallIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  overallAmount: {
    fontSize: 36,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  overallSubtext: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountsList: {
    gap: 12,
  },
  accountItem: {
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
  accountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  defaultBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountType: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
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
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2563eb',
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
