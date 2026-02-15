import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import PageHeader from '@/components/page-header';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';

export default function AccountDetailsScreen() {
  const params = useLocalSearchParams();
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<'add' | 'reduce' | 'transfer'>('add');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as any });

  const loadAccountDetails = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const res = await api.getAccount(params.id as string);
      if (res.success && res.data) {
        const data = res.data as any;
        setAccount(data.account);
        
        // Format transactions
        const formattedTransactions = (data.transactions || []).map((t: any) => ({
          id: t.id,
          type: t.type === 'income' || t.type === 'credit' ? 'credit' : 'debit',
          amount: t.amount,
          date: new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: t.description || t.title || 'Transaction',
          category: t.category || 'General',
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error loading account details:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadAccountDetails();
  }, [loadAccountDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAccountDetails();
    setRefreshing(false);
  }, [loadAccountDetails]);

  const handleDelete = async () => {
    if (!account) return;
    
    setDeleting(true);
    try {
      const res = await api.deleteAccount(account.id);
      
      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to delete account', type: 'error' });
        setShowAlert(true);
        setDeleting(false);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Account deleted successfully!', type: 'success' });
      setShowAlert(true);
      
      setTimeout(() => {
        setShowAlert(false);
        setShowDeleteConfirm(false);
        // Navigate back
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      }, 1500);
    } catch (e) {
      console.error('Account delete error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while deleting', type: 'error' });
      setShowAlert(true);
      setDeleting(false);
    }
  };

  const openAdjustModal = (type: 'add' | 'reduce' | 'transfer') => {
    setAdjustType(type);
    setShowAdjustModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Account Details" showBack={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.container}>
        <PageHeader title="Account Details" showBack={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
          <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 16 }}>Account not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Account Details" showBack={true} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Account Header */}
        <View style={styles.accountHeader}>
          <View style={[styles.accountIcon, { backgroundColor: `${account.color || '#3b82f6'}20` }]}>
            <Ionicons name={(account.icon || 'card') as any} size={40} color={account.color || '#3b82f6'} />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          {account.accountNumber && (
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
          )}
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>
              {CURRENCY_SYMBOL}{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editAccountButton} 
              onPress={() => setShowEditModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#2563eb" />
              <Text style={styles.editAccountText}>Edit</Text>
            </TouchableOpacity>
            
            {!account.isDefault && (
              <TouchableOpacity 
                style={styles.deleteAccountButton} 
                onPress={() => setShowDeleteConfirm(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.deleteAccountText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      transaction.type === 'credit' ? styles.creditIcon : styles.debitIcon
                    ]}>
                      <Ionicons 
                        name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
                        size={20} 
                        color={transaction.type === 'credit' ? '#10b981' : '#ef4444'} 
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                  </View>

                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.adjustButton, styles.addMoneyButton]}
          onPress={() => openAdjustModal('add')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" />
          <Text style={styles.adjustButtonText}>Add Money</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.adjustButton, styles.reduceMoneyButton]}
          onPress={() => openAdjustModal('reduce')}
          activeOpacity={0.7}
        >
          <Ionicons name="remove-circle" size={20} color="#ffffff" />
          <Text style={styles.adjustButtonText}>Reduce</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.adjustButton, styles.transferButton]}
          onPress={() => openAdjustModal('transfer')}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-horizontal" size={20} color="#ffffff" />
          <Text style={styles.adjustButtonText}>Transfer</Text>
        </TouchableOpacity>
      </View>

      <AdjustBalanceModal 
        visible={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        type={adjustType}
        account={account}
        onSaved={loadAccountDetails}
      />

      <EditAccountModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        account={account}
        onSaved={loadAccountDetails}
      />

      {/* Delete Confirmation */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteModal}>
            <Ionicons name="warning" size={48} color="#ef4444" />
            <Text style={styles.deleteTitle}>Delete Account?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this account? This action cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity 
                style={styles.deleteCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteConfirmButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.deleteConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

// Edit Account Modal Component
interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  account: any;
  onSaved?: () => void;
}

function EditAccountModal({ visible, onClose, account, onSaved }: EditAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as any });

  useEffect(() => {
    if (visible && account) {
      setAccountName(account.name || '');
      setAccountNumber(account.accountNumber || '');
      setBankName(account.bankName || '');
      setIfscCode(account.ifscCode || '');
    }
  }, [visible, account]);

  const handleSave = async () => {
    if (!accountName.trim()) {
      setAlertConfig({ title: 'Validation Error', message: 'Account name is required', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateAccount(account.id, {
        name: accountName.trim(),
        accountNumber: accountNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        ifscCode: ifscCode.trim() || undefined,
      });

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to update account', type: 'error' });
        setShowAlert(true);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Account updated successfully!', type: 'success' });
      setShowAlert(true);
      
      setTimeout(() => {
        setShowAlert(false);
        onSaved?.();
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Account update error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while updating', type: 'error' });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Account</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Account name"
                placeholderTextColor="#9ca3af"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>

            {account?.type === 'bank' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Bank name"
                    placeholderTextColor="#9ca3af"
                    value={bankName}
                    onChangeText={setBankName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Account number"
                    placeholderTextColor="#9ca3af"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>IFSC Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="IFSC code"
                    placeholderTextColor="#9ca3af"
                    value={ifscCode}
                    onChangeText={setIfscCode}
                    autoCapitalize="characters"
                  />
                </View>
              </>
            )}

            {account?.type === 'wallet' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number / ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number or ID"
                  placeholderTextColor="#9ca3af"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
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

// Adjust Balance Modal Component
interface AdjustBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'add' | 'reduce' | 'transfer';
  account: any;
  onSaved?: () => void;
}

function AdjustBalanceModal({ visible, onClose, type, account, onSaved }: AdjustBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [date, setDate] = useState('Today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as any });

  const dateOptions = ['Today', 'Yesterday', '2 days ago', '3 days ago', 'This week', 'Custom'];

  useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  const loadAccounts = async () => {
    try {
      const res = await api.getAccounts();
      if (res.success && res.data) {
        const data = res.data as any;
        // Filter out current account for transfer
        const filteredAccounts = type === 'transfer' 
          ? (data.accounts || []).filter((acc: any) => acc.id !== account?.id)
          : (data.accounts || []);
        setAccounts(filteredAccounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const getTitle = () => {
    if (type === 'add') return 'Add Money';
    if (type === 'reduce') return 'Reduce Money';
    return 'Transfer Balance';
  };

  const getColor = () => {
    if (type === 'add') return '#10b981';
    if (type === 'reduce') return '#ef4444';
    return '#2563eb';
  };

  const handleSave = async () => {
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      setAlertConfig({ title: 'Validation Error', message: 'Amount must be a positive number', type: 'error' });
      setShowAlert(true);
      return;
    }

    if (type === 'transfer' && !selectedAccountId) {
      setAlertConfig({ title: 'Validation Error', message: 'Please select a destination account', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      // Create transaction to adjust balance
      const transactionData: any = {
        accountId: account.id,
        amount: type === 'reduce' ? -amt : amt,
        type: type === 'add' ? 'income' : 'expense',
        description: notes.trim() || `${getTitle()} - ${account.name}`,
        date: new Date().toISOString(),
      };

      if (type === 'transfer' && selectedAccountId) {
        transactionData.toAccountId = selectedAccountId;
        transactionData.type = 'transfer';
      }

      const res = await api.createTransaction(transactionData);

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to adjust balance', type: 'error' });
        setShowAlert(true);
        return;
      }

      setAlertConfig({ title: 'Success', message: `Balance ${type === 'add' ? 'added' : type === 'reduce' ? 'reduced' : 'transferred'} successfully!`, type: 'success' });
      setShowAlert(true);
      
      setTimeout(() => {
        setShowAlert(false);
        setAmount('');
        setSelectedAccountId('');
        setNotes('');
        onSaved?.();
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Balance adjustment error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong', type: 'error' });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.amountSection}>
              <Text style={[styles.currencySymbol, { color: getColor() }]}>{CURRENCY_SYMBOL}</Text>
              <TextInput
                style={[styles.amountInput, { color: getColor() }]}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            {type === 'transfer' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>From Account</Text>
                <View style={styles.accountInfo}>
                  <Ionicons name="wallet" size={20} color="#2563eb" />
                  <Text style={styles.accountInfoText}>{account?.name}</Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {type === 'transfer' ? 'To Account' : 'Select Account'}
              </Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowAccountPicker(true)}
              >
                <Ionicons name="wallet-outline" size={20} color="#6b7280" />
                <Text style={styles.selectText}>
                  {selectedAccount?.name || 'Choose account...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.selectText}>{date}</Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes / Remarks</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Add notes..."
                placeholderTextColor="#9ca3af"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: getColor() }]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountPicker(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.pickerOption,
                    selectedAccountId === acc.id && styles.pickerOptionActive
                  ]}
                  onPress={() => {
                    setSelectedAccountId(acc.id);
                    setShowAccountPicker(false);
                  }}
                >
                  <View style={styles.pickerAccountInfo}>
                    <View style={[styles.pickerAccountIcon, { backgroundColor: `${acc.color}20` }]}>
                      <Ionicons name={acc.icon as any} size={20} color={acc.color} />
                    </View>
                    <View>
                      <Text style={[
                        styles.pickerOptionText,
                        selectedAccountId === acc.id && styles.pickerOptionTextActive
                      ]}>
                        {acc.name}
                      </Text>
                      <Text style={styles.pickerAccountBalance}>
                        {CURRENCY_SYMBOL}{acc.balance.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                  {selectedAccountId === acc.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  accountHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  accountNumber: {
    fontSize: 14,
    color: '#6b7280',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
  },
  editAccountText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
  },
  deleteAccountText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  creditIcon: {
    backgroundColor: '#d1fae5',
  },
  debitIcon: {
    backgroundColor: '#fee2e2',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  creditAmount: {
    color: '#10b981',
  },
  debitAmount: {
    color: '#ef4444',
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
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
  },
  adjustButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  addMoneyButton: {
    backgroundColor: '#10b981',
  },
  reduceMoneyButton: {
    backgroundColor: '#ef4444',
  },
  transferButton: {
    backgroundColor: '#2563eb',
  },
  adjustButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalOverlay: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalForm: {
    padding: 20,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 150,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  accountInfoText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  imageUpload: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  pickerList: {
    padding: 12,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  pickerOptionActive: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  pickerOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  pickerAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pickerAccountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerAccountBalance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
});
