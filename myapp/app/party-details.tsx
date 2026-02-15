import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';
import AddPartyTransactionModal from '@/components/add-party-transaction-modal';
import SettlePartyModal from '@/components/settle-party-modal';

export default function PartyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('transactions');
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showSettle, setShowSettle] = useState(false);

  const loadPartyDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      const res = await api.getParty(String(id));
      if (res.success && res.data) {
        setParty(res.data);
      } else {
        setAlertConfig({ title: 'Error', message: res.message || 'Failed to load party details', type: 'error' });
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error loading party details:', error);
      setAlertConfig({ title: 'Error', message: 'Something went wrong', type: 'error' });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPartyDetails();
  }, [loadPartyDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPartyDetails();
    setRefreshing(false);
  }, [loadPartyDetails]);

  const handleCall = () => {
    if (party?.phone) {
      Linking.openURL(`tel:${party.phone}`);
    }
  };

  const handleEmail = () => {
    if (party?.email) {
      Linking.openURL(`mailto:${party.email}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const res = await api.deleteParty(String(id));
      if (res.success) {
        setAlertConfig({ title: 'Success', message: 'Party deleted successfully', type: 'success' });
        setShowAlert(true);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setAlertConfig({ title: 'Error', message: res.message || 'Failed to delete party', type: 'error' });
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error deleting party:', error);
      setAlertConfig({ title: 'Error', message: 'Something went wrong', type: 'error' });
      setShowAlert(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Party Details" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (!party) {
    return (
      <View style={styles.container}>
        <PageHeader title="Party Details" showBack={true} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>Party not found</Text>
        </View>
        <Alert
          visible={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
        />
      </View>
    );
  }

  const transactions = party.transactions || [];

  return (
    <View style={styles.container}>
      <PageHeader title="Party Details" showBack={true} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Party Header */}
        <View style={styles.partyHeader}>
          <View style={styles.partyAvatar}>
            <Text style={styles.partyInitial}>{party.name.charAt(0)}</Text>
          </View>
          <Text style={styles.partyName}>{party.name}</Text>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>
              {party.type === 'receive' ? 'You\'ll Receive' : 'You\'ll Give'}
            </Text>
            <Text style={[
              styles.balanceAmount,
              party.type === 'receive' ? styles.receiveAmount : styles.giveAmount
            ]}>
              {CURRENCY_SYMBOL}{party.balance.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall} disabled={!party.phone}>
              <Ionicons name="call" size={20} color="#2563eb" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleEmail} disabled={!party.email}>
              <Ionicons name="mail" size={20} color="#2563eb" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'transactions' && styles.tabActive]}
            onPress={() => setSelectedTab('transactions')}
          >
            <Text style={[styles.tabText, selectedTab === 'transactions' && styles.tabTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'details' && styles.tabActive]}
            onPress={() => setSelectedTab('details')}
          >
            <Text style={[styles.tabText, selectedTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'transactions' ? (
          <View style={styles.transactionsSection}>
            {transactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {transactions.map((transaction: any) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionIcon,
                        transaction.type === 'income' ? styles.saleIcon : styles.paymentIcon
                      ]}>
                        <Ionicons 
                          name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                          size={20} 
                          color={transaction.type === 'income' ? '#10b981' : '#ef4444'} 
                        />
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description || transaction.type}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.positiveAmount : styles.negativeAmount
                      ]}>
                        {transaction.type === 'income' ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.detailsSection}>
            <View style={styles.detailsList}>
              {party.phone && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="call-outline" size={20} color="#2563eb" />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{party.phone}</Text>
                  </View>
                </View>
              )}

              {party.email && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="mail-outline" size={20} color="#2563eb" />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{party.email}</Text>
                  </View>
                </View>
              )}

              {party.address && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="location-outline" size={20} color="#2563eb" />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{party.address}</Text>
                  </View>
                </View>
              )}

              {party.panNumber && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="card-outline" size={20} color="#2563eb" />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>PAN Number</Text>
                    <Text style={styles.detailValue}>{party.panNumber}</Text>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="wallet-outline" size={20} color="#2563eb" />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Opening Balance</Text>
                  <Text style={styles.detailValue}>
                    {CURRENCY_SYMBOL}{(party.openingBalance || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {party.asOfDate && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="calendar-outline" size={20} color="#2563eb" />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>As of Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(party.asOfDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time-outline" size={20} color="#2563eb" />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Created At</Text>
                  <Text style={styles.detailValue}>
                    {new Date(party.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Alert
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.addTransactionButton]}
          activeOpacity={0.7}
          onPress={() => setShowAddTransaction(true)}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" />
          <Text style={styles.bottomButtonText}>Add Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bottomButton, styles.settleButton]}
          activeOpacity={0.7}
          onPress={() => setShowSettle(true)}
          disabled={!party || party.balance === 0}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.bottomButtonText}>Settle</Text>
        </TouchableOpacity>
      </View>

      {party && (
        <>
          <AddPartyTransactionModal
            visible={showAddTransaction}
            onClose={() => setShowAddTransaction(false)}
            onSaved={loadPartyDetails}
            partyId={String(id)}
            partyName={party.name}
            partyType={party.type}
          />

          <SettlePartyModal
            visible={showSettle}
            onClose={() => setShowSettle(false)}
            onSaved={loadPartyDetails}
            partyId={String(id)}
            partyName={party.name}
            partyType={party.type}
            currentBalance={party.balance}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  content: {
    flex: 1,
  },
  partyHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  partyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    borderWidth: 3,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  partyInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  balanceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 200,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  receiveAmount: {
    color: '#10b981',
  },
  giveAmount: {
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  transactionsSection: {
    padding: 20,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleIcon: {
    backgroundColor: '#d1fae5',
  },
  paymentIcon: {
    backgroundColor: '#fee2e2',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  transactionBalance: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  detailsSection: {
    padding: 20,
  },
  detailsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  addTransactionButton: {
    backgroundColor: '#2563eb',
  },
  settleButton: {
    backgroundColor: '#10b981',
  },
  bottomButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
