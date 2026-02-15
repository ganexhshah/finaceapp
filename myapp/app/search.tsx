import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'account' | 'party'>('all');

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const [incomesRes, expensesRes, accountsRes, partiesRes] = await Promise.all([
        api.getIncomes(),
        api.getExpenses(),
        api.getAccounts(),
        api.getParties(),
      ]);

      const results: any[] = [];
      const lowerQuery = query.toLowerCase();

      // Search incomes
      if (incomesRes.success && incomesRes.data) {
        const incomesData = incomesRes.data as any;
        const incomesList = incomesData.incomes || [];
        incomesList.forEach((income: any) => {
          if (
            income.title?.toLowerCase().includes(lowerQuery) ||
            income.category?.name?.toLowerCase().includes(lowerQuery) ||
            income.notes?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `income-${income.id}`,
              type: 'income',
              title: income.title,
              subtitle: income.category?.name || 'Income',
              amount: income.amount,
              date: new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              icon: income.category?.icon || 'wallet',
              color: '#10b981',
              data: income,
            });
          }
        });
      }

      // Search expenses
      if (expensesRes.success && expensesRes.data) {
        const expensesData = expensesRes.data as any;
        const expensesList = expensesData.expenses || [];
        expensesList.forEach((expense: any) => {
          if (
            expense.title?.toLowerCase().includes(lowerQuery) ||
            expense.category?.name?.toLowerCase().includes(lowerQuery) ||
            expense.notes?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `expense-${expense.id}`,
              type: 'expense',
              title: expense.title,
              subtitle: expense.category?.name || 'Expense',
              amount: expense.amount,
              date: new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              icon: expense.category?.icon || 'cart',
              color: '#ef4444',
              data: expense,
            });
          }
        });
      }

      // Search accounts
      if (accountsRes.success && accountsRes.data) {
        const accountsData = accountsRes.data as any;
        const accountsList = accountsData.accounts || [];
        accountsList.forEach((account: any) => {
          if (
            account.name?.toLowerCase().includes(lowerQuery) ||
            account.type?.toLowerCase().includes(lowerQuery) ||
            account.bankName?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `account-${account.id}`,
              type: 'account',
              title: account.name,
              subtitle: account.type.charAt(0).toUpperCase() + account.type.slice(1),
              amount: account.balance,
              icon: account.icon || 'wallet',
              color: account.color || '#2563eb',
              data: account,
            });
          }
        });
      }

      // Search parties
      if (partiesRes.success && partiesRes.data) {
        const partiesList = Array.isArray(partiesRes.data) ? partiesRes.data : [];
        partiesList.forEach((party: any) => {
          if (
            party.name?.toLowerCase().includes(lowerQuery) ||
            party.phone?.toLowerCase().includes(lowerQuery) ||
            party.notes?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `party-${party.id}`,
              type: 'party',
              title: party.name,
              subtitle: party.type === 'receive' ? 'To Receive' : 'To Give',
              amount: party.balance,
              icon: 'person',
              color: party.type === 'receive' ? '#10b981' : '#ef4444',
              data: party,
            });
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredResults = searchResults.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  const handleResultPress = (result: any) => {
    switch (result.type) {
      case 'income':
        router.push('/income');
        break;
      case 'expense':
        router.push('/expense');
        break;
      case 'account':
        router.push({ pathname: '/account-details', params: { id: result.data.id } });
        break;
      case 'party':
        router.push({ pathname: '/party-details', params: { id: result.data.id } });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions, accounts..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          <TouchableOpacity 
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, activeTab === 'income' && styles.filterTabActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.filterTabText, activeTab === 'income' && styles.filterTabTextActive]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, activeTab === 'expense' && styles.filterTabActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.filterTabText, activeTab === 'expense' && styles.filterTabTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, activeTab === 'account' && styles.filterTabActive]}
            onPress={() => setActiveTab('account')}
          >
            <Text style={[styles.filterTabText, activeTab === 'account' && styles.filterTabTextActive]}>
              Accounts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, activeTab === 'party' && styles.filterTabActive]}
            onPress={() => setActiveTab('party')}
          >
            <Text style={[styles.filterTabText, activeTab === 'party' && styles.filterTabTextActive]}>
              Parties
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : searchQuery.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Search Everything</Text>
            <Text style={styles.emptyText}>
              Find your transactions, accounts, and parties quickly
            </Text>
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {filteredResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleResultPress(result)}
                activeOpacity={0.7}
              >
                <View style={[styles.resultIcon, { backgroundColor: `${result.color}20` }]}>
                  <Ionicons name={result.icon as any} size={24} color={result.color} />
                </View>

                <View style={styles.resultDetails}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                    {result.date && (
                      <>
                        <Text style={styles.resultDot}>•</Text>
                        <Text style={styles.resultDate}>{result.date}</Text>
                      </>
                    )}
                  </View>
                </View>

                {result.amount !== undefined && (
                  <Text style={[styles.resultAmount, { color: result.color }]}>
                    {result.type === 'income' ? '+' : result.type === 'expense' ? '-' : ''}
                    {CURRENCY_SYMBOL}{Math.abs(result.amount).toLocaleString('en-IN')}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f9fafb',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterTabs: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resultDot: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  resultDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  resultAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  bottomSpacing: {
    height: 40,
  },
});
