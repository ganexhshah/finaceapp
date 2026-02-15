import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import AddPartyModal from '@/components/add-party-modal';
import api from '@/lib/api';

export default function PartiesScreen() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadParties = useCallback(async () => {
    try {
      const res = await api.getParties();
      if (res.success && res.data) {
        // Backend returns { parties: [], summary: {} }
        const partiesData = res.data.parties || res.data;
        setParties(Array.isArray(partiesData) ? partiesData : []);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParties();
    setRefreshing(false);
  }, [loadParties]);

  const filteredParties = parties.filter(party => {
    if (selectedTab === 'all') return true;
    return party.type === selectedTab;
  });

  const totalReceive = parties.filter(p => p.type === 'receive').reduce((sum, p) => sum + p.balance, 0);
  const totalGive = parties.filter(p => p.type === 'give').reduce((sum, p) => sum + p.balance, 0);

  return (
    <View style={styles.container}>
      <PageHeader title="Parties" showBack={true} />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.receiveCard]}>
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-down" size={24} color="#10b981" />
            </View>
            <Text style={styles.cardLabel}>You'll Receive</Text>
            <Text style={[styles.cardAmount, styles.receiveAmount]}>
              {CURRENCY_SYMBOL}{totalReceive.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.giveCard]}>
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-up" size={24} color="#ef4444" />
            </View>
            <Text style={styles.cardLabel}>You'll Give</Text>
            <Text style={[styles.cardAmount, styles.giveAmount]}>
              {CURRENCY_SYMBOL}{totalGive.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'all' && styles.filterTabTextActive]}>
              All ({parties.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'receive' && styles.filterTabActive]}
            onPress={() => setSelectedTab('receive')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'receive' && styles.filterTabTextActive]}>
              To Receive ({parties.filter(p => p.type === 'receive').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'give' && styles.filterTabActive]}
            onPress={() => setSelectedTab('give')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'give' && styles.filterTabTextActive]}>
              To Give ({parties.filter(p => p.type === 'give').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Parties List */}
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color="#2563eb" />
          </View>
        ) : filteredParties.length > 0 ? (
          <View style={styles.partiesList}>
            {filteredParties.map((party) => (
              <TouchableOpacity 
                key={party.id} 
                style={styles.partyItem}
                onPress={() => router.push({ pathname: '/party-details', params: { id: String(party.id) } })}
                activeOpacity={0.7}
              >
                <View style={styles.partyAvatar}>
                  <Text style={styles.partyInitial}>{party.name.charAt(0)}</Text>
                </View>

                <View style={styles.partyDetails}>
                  <Text style={styles.partyName}>{party.name}</Text>
                  {party.phone && (
                    <View style={styles.partyMeta}>
                      <Ionicons name="call-outline" size={12} color="#6b7280" />
                      <Text style={styles.partyPhone}>{party.phone}</Text>
                    </View>
                  )}
                  <Text style={styles.partyDate}>Since {new Date(party.createdAt || party.date).toLocaleDateString()}</Text>
                </View>

                <View style={styles.partyRight}>
                  <Text style={[
                    styles.partyBalance,
                    party.type === 'receive' ? styles.receiveBalance : styles.giveBalance
                  ]}>
                    {CURRENCY_SYMBOL}{(party.balance || 0).toLocaleString('en-IN')}
                  </Text>
                  <View style={[
                    styles.partyBadge,
                    party.type === 'receive' ? styles.receiveBadge : styles.giveBadge
                  ]}>
                    <Text style={[
                      styles.partyBadgeText,
                      party.type === 'receive' ? styles.receiveBadgeText : styles.giveBadgeText
                    ]}>
                      {party.type === 'receive' ? 'To Receive' : 'To Give'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No parties found</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add New Party</Text>
        </TouchableOpacity>
      </View>

      <AddPartyModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={loadParties}
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
  receiveCard: {
    backgroundColor: '#d1fae5',
  },
  giveCard: {
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
  receiveAmount: {
    color: '#065f46',
  },
  giveAmount: {
    color: '#991b1b',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  partiesList: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  partyItem: {
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
  partyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partyInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyDetails: {
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  partyPhone: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  partyBalance: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  receiveBalance: {
    color: '#10b981',
  },
  giveBalance: {
    color: '#ef4444',
  },
  partyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receiveBadge: {
    backgroundColor: '#d1fae5',
  },
  giveBadge: {
    backgroundColor: '#fee2e2',
  },
  partyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  receiveBadgeText: {
    color: '#10b981',
  },
  giveBadgeText: {
    color: '#ef4444',
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
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
