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

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function AddAccountModal({ visible, onClose, onSaved }: AddAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('bank');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  const accountTypes = [
    { id: 'cash', name: 'Cash', icon: 'cash', color: '#10b981' },
    { id: 'bank', name: 'Bank Account', icon: 'card', color: '#3b82f6' },
    { id: 'wallet', name: 'Digital Wallet', icon: 'wallet', color: '#6366f1' },
  ];

  const resetForm = () => {
    setAccountName('');
    setAccountType('bank');
    setOpeningBalance('');
    setAccountNumber('');
    setBankName('');
    setIfscCode('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!accountName.trim()) {
      setAlertConfig({ title: 'Validation Error', message: 'Account name is required', type: 'error' });
      setShowAlert(true);
      return;
    }

    const balance = openingBalance ? Number(openingBalance) : 0;
    if (Number.isNaN(balance)) {
      setAlertConfig({ title: 'Validation Error', message: 'Opening balance must be a number', type: 'error' });
      setShowAlert(true);
      return;
    }

    const typeMeta = accountTypes.find(t => t.id === accountType);

    setSaving(true);
    try {
      const response = await api.createAccount({
        name: accountName.trim(),
        type: accountType,
        balance,
        accountNumber: accountNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        ifscCode: ifscCode.trim() || undefined,
        icon: typeMeta?.icon,
        color: typeMeta?.color,
        // notes currently not supported by backend account schema
      });

      if (!response.success) {
        setAlertConfig({ title: 'Failed', message: response.message || 'Failed to create account', type: 'error' });
        setShowAlert(true);
        return;
      }

      resetForm();
      onSaved?.();
      onClose();
    } catch (e) {
      setAlertConfig({ title: 'Error', message: 'Something went wrong while creating the account', type: 'error' });
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
            <Text style={styles.headerTitle}>Add New Account</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.typeGrid}>
                {accountTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeItem,
                      accountType === type.id && styles.typeItemActive,
                      { borderColor: accountType === type.id ? type.color : '#e5e7eb' }
                    ]}
                    onPress={() => setAccountType(type.id)}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                      <Ionicons
                        name={type.icon as any}
                        size={24}
                        color={type.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeText,
                        accountType === type.id && { color: type.color, fontWeight: '700' }
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., HDFC Savings"
                placeholderTextColor="#9ca3af"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>

            {accountType === 'bank' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., HDFC Bank"
                    placeholderTextColor="#9ca3af"
                    value={bankName}
                    onChangeText={setBankName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account number"
                    placeholderTextColor="#9ca3af"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>IFSC Code (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., HDFC0001234"
                    placeholderTextColor="#9ca3af"
                    value={ifscCode}
                    onChangeText={setIfscCode}
                    autoCapitalize="characters"
                  />
                </View>
              </>
            )}

            {accountType === 'wallet' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number / ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., +91 98765 43210"
                  placeholderTextColor="#9ca3af"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Opening Balance</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

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
                <Text style={styles.saveButtonText}>Add Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
  typeGrid: {
    gap: 12,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 12,
  },
  typeItemActive: {
    backgroundColor: '#ffffff',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
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
});
