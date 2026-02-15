import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';
import { resolveDateOptionToISO } from '@/lib/dates';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type Category = { id: string; name: string; icon?: string; type: 'income' | 'expense' };
type Account = { id: string; name: string; type: string; balance: number; icon?: string; color?: string };

export default function AddExpenseModal({ visible, onClose, onSaved }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [date, setDate] = useState('Today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  React.useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      setLoadingMeta(true);
      try {
        const [catRes, accRes] = await Promise.all([api.getCategories('expense'), api.getAccounts()]);
        if (!mounted) return;

        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data as any);
          if (!selectedCategoryId && (catRes.data as any).length > 0) {
            setSelectedCategoryId((catRes.data as any)[0].id);
          }
        }

        if (accRes.success && accRes.data) {
          const accountsData = accRes.data as any;
          setAccounts(accountsData.accounts || []);
        }
      } finally {
        if (mounted) setLoadingMeta(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dateOptions = ['Today', 'Yesterday', '2 days ago', '3 days ago', 'This week', 'Last week', 'Custom'];

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const resetForm = () => {
    setAmount('');
    setTitle('');
    setNotes('');
    setRecurring(false);
    setDate('Today');
    setSelectedAccountId(null);
  };

  const handleSave = async () => {
    const amt = Number(amount);
    if (!title.trim()) {
      setAlertConfig({ title: 'Validation Error', message: 'Title is required', type: 'error' });
      setShowAlert(true);
      return;
    }
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      setAlertConfig({ title: 'Validation Error', message: 'Amount must be a positive number', type: 'error' });
      setShowAlert(true);
      return;
    }
    if (!selectedCategoryId) {
      setAlertConfig({ title: 'Validation Error', message: 'Please select a category', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      const response = await api.createExpense({
        categoryId: selectedCategoryId,
        accountId: selectedAccountId || undefined,
        title: title.trim(),
        amount: amt,
        date: resolveDateOptionToISO(date),
        isRecurring: recurring,
        notes: notes.trim() || undefined,
      });

      if (!response.success) {
        setAlertConfig({ title: 'Failed', message: response.message || 'Failed to create expense', type: 'error' });
        setShowAlert(true);
        return;
      }

      resetForm();
      onSaved?.();
      onClose();
    } catch (e) {
      setAlertConfig({ title: 'Error', message: 'Something went wrong while saving expense', type: 'error' });
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Expense</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.amountSection}>
              <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grocery Shopping"
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {loadingMeta && categories.length === 0 ? (
                  <View style={{ paddingVertical: 12 }}>
                    <ActivityIndicator color="#ef4444" />
                  </View>
                ) : categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.categoryItemActive,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Ionicons
                      name={(category.icon || 'pricetag') as any}
                      size={24}
                      color={selectedCategoryId === category.id ? '#ef4444' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategoryId === category.id && styles.categoryTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowAccountPicker(true)}
              >
                <Ionicons name="wallet-outline" size={20} color="#6b7280" />
                <Text style={styles.dateText}>
                  {selectedAccountId
                    ? (accounts.find(a => a.id === selectedAccountId)?.name || 'Selected')
                    : 'Choose account...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.dateText}>{date}</Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.recurringToggle}
              onPress={() => setRecurring(!recurring)}
            >
              <View style={styles.recurringLeft}>
                <Ionicons name="repeat" size={20} color="#6b7280" />
                <Text style={styles.recurringLabel}>Recurring Expense</Text>
              </View>
              <View style={[styles.toggle, recurring && styles.toggleActive]}>
                <View style={[styles.toggleThumb, recurring && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
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

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Expense</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.datePickerOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
              {dateOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateOption,
                    date === option && styles.dateOptionActive
                  ]}
                  onPress={() => handleDateSelect(option)}
                >
                  <Text style={[
                    styles.dateOptionText,
                    date === option && styles.dateOptionTextActive
                  ]}>
                    {option}
                  </Text>
                  {date === option && (
                    <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <TouchableOpacity
          style={styles.datePickerOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountPicker(false)}
        >
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.dateOption, !selectedAccountId && styles.dateOptionActive]}
                onPress={() => {
                  setSelectedAccountId(null);
                  setShowAccountPicker(false);
                }}
              >
                <Text style={[styles.dateOptionText, !selectedAccountId && styles.dateOptionTextActive]}>
                  No account
                </Text>
                {!selectedAccountId && (
                  <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                )}
              </TouchableOpacity>

              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.dateOption, selectedAccountId === acc.id && styles.dateOptionActive]}
                  onPress={() => {
                    setSelectedAccountId(acc.id);
                    setShowAccountPicker(false);
                  }}
                >
                  <Text style={[styles.dateOptionText, selectedAccountId === acc.id && styles.dateOptionTextActive]}>
                    {acc.name}
                  </Text>
                  {selectedAccountId === acc.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
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
  overlay: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  form: {
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
    color: '#ef4444',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ef4444',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  categoryItemActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  categoryText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  categoryTextActive: {
    color: '#ef4444',
  },
  dateButton: {
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
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#ef4444',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
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
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerContent: {
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
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateList: {
    padding: 12,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  dateOptionActive: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  dateOptionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateOptionTextActive: {
    color: '#ef4444',
    fontWeight: '700',
  },
});
