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

interface AddPartyTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
  partyId: string;
  partyName: string;
  partyType: 'receive' | 'give';
}

export default function AddPartyTransactionModal({ 
  visible, 
  onClose, 
  onSaved,
  partyId,
  partyName,
  partyType,
}: AddPartyTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>(
    partyType === 'receive' ? 'credit' : 'debit'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('Today');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  const dateOptions = ['Today', 'Yesterday', '1 week ago', '1 month ago', 'Custom'];

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const resetForm = () => {
    setTransactionType(partyType === 'receive' ? 'credit' : 'debit');
    setAmount('');
    setDescription('');
    setDate('Today');
    setNotes('');
  };

  const handleSave = async () => {
    if (!amount || !description.trim()) {
      setAlertConfig({ title: 'Validation Error', message: 'Amount and description are required', type: 'error' });
      setShowAlert(true);
      return;
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setAlertConfig({ title: 'Validation Error', message: 'Amount must be a positive number', type: 'error' });
      setShowAlert(true);
      return;
    }

    setSaving(true);
    try {
      const response = await api.createTransaction({
        partyId,
        type: transactionType,
        amount: amountNum,
        description: description.trim(),
        date: resolveDateOptionToISO(date),
        notes: notes.trim() || undefined,
      });

      if (!response.success) {
        setAlertConfig({ title: 'Failed', message: response.message || 'Failed to create transaction', type: 'error' });
        setShowAlert(true);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Transaction added successfully', type: 'success' });
      setShowAlert(true);
      
      setTimeout(() => {
        resetForm();
        onSaved?.();
        onClose();
      }, 1500);
    } catch (e) {
      setAlertConfig({ title: 'Error', message: 'Something went wrong while saving transaction', type: 'error' });
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
            <Text style={styles.headerTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Party Info */}
            <View style={styles.partyInfo}>
              <View style={styles.partyAvatar}>
                <Text style={styles.partyInitial}>{partyName.charAt(0)}</Text>
              </View>
              <Text style={styles.partyName}>{partyName}</Text>
            </View>

            {/* Transaction Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Transaction Type</Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    transactionType === 'credit' && styles.typeOptionActive,
                    { borderColor: transactionType === 'credit' ? '#10b981' : '#e5e7eb' }
                  ]}
                  onPress={() => setTransactionType('credit')}
                >
                  <Ionicons 
                    name="arrow-down-circle" 
                    size={24} 
                    color={transactionType === 'credit' ? '#10b981' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    transactionType === 'credit' && { color: '#10b981' }
                  ]}>
                    {partyType === 'receive' ? 'You Received' : 'You Paid'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    transactionType === 'debit' && styles.typeOptionActive,
                    { borderColor: transactionType === 'debit' ? '#ef4444' : '#e5e7eb' }
                  ]}
                  onPress={() => setTransactionType('debit')}
                >
                  <Ionicons 
                    name="arrow-up-circle" 
                    size={24} 
                    color={transactionType === 'debit' ? '#ef4444' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    transactionType === 'debit' && { color: '#ef4444' }
                  ]}>
                    {partyType === 'receive' ? 'You Paid' : 'You Received'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount *</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>{CURRENCY_SYMBOL}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter description"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Date */}
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

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="create-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add notes"
                  placeholderTextColor="#9ca3af"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
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
                <Text style={styles.saveButtonText}>Save Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.dateList}>
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
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
  partyInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  partyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
  },
  typeOptionActive: {
    backgroundColor: '#ffffff',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  textAreaContainer: {
    height: 'auto',
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 60,
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
    backgroundColor: '#2563eb',
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
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  dateOptionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  dateOptionTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
