import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY_SYMBOL } from '@/constants/currency';
import api from '@/lib/api';
import Alert from '@/components/alert';

interface IncomeDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  income: any;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function IncomeDetailsModal({ visible, onClose, income, onUpdated, onDeleted }: IncomeDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' as any });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible && income) {
      setTitle(income.title || '');
      setAmount(income.amount?.toString() || '');
      setNotes(income.notes || '');
      setIsEditing(false);
    }
  }, [visible, income]);

  const handleUpdate = async () => {
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

    setSaving(true);
    try {
      const res = await api.updateIncome(income.id, {
        title: title.trim(),
        amount: amt,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to update income', type: 'error' });
        setShowAlert(true);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Income updated successfully!', type: 'success' });
      setShowAlert(true);
      setIsEditing(false);
      
      setTimeout(() => {
        setShowAlert(false);
        onUpdated?.();
      }, 1500);
    } catch (e) {
      console.error('Income update error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while updating', type: 'error' });
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.deleteIncome(income.id);

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to delete income', type: 'error' });
        setShowAlert(true);
        setDeleting(false);
        return;
      }

      setAlertConfig({ title: 'Success', message: 'Income deleted successfully!', type: 'success' });
      setShowAlert(true);
      
      setTimeout(() => {
        setShowAlert(false);
        setShowDeleteConfirm(false);
        onDeleted?.();
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Income delete error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while deleting', type: 'error' });
      setShowAlert(true);
      setDeleting(false);
    }
  };

  if (!income) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Income Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Info */}
            <View style={styles.categorySection}>
              <View style={styles.categoryIcon}>
                <Ionicons 
                  name={(income.category?.icon || 'wallet') as any} 
                  size={32} 
                  color="#10b981" 
                />
              </View>
              <Text style={styles.categoryName}>{income.category?.name || 'Income'}</Text>
              {income.recurring && (
                <View style={styles.recurringBadge}>
                  <Ionicons name="repeat" size={14} color="#10b981" />
                  <Text style={styles.recurringText}>Recurring</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Income title"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text style={styles.valueText}>{income.title}</Text>
              )}
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              {isEditing ? (
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ) : (
                <Text style={[styles.valueText, styles.amountValue]}>
                  {CURRENCY_SYMBOL}{income.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              )}
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.valueText}>{income.date}</Text>
            </View>

            {/* Account */}
            {income.account && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account</Text>
                <Text style={styles.valueText}>{income.account.name}</Text>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes (optional)"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.valueText}>{income.notes || 'No notes'}</Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setIsEditing(false);
                    setTitle(income.title || '');
                    setAmount(income.amount?.toString() || '');
                    setNotes(income.notes || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => setShowDeleteConfirm(true)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#ffffff" />
                  <Text style={styles.editButtonText}>Edit Income</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

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
            <Text style={styles.deleteTitle}>Delete Income?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this income? This action cannot be undone.
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
  content: {
    padding: 20,
  },
  categorySection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  recurringText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
  valueText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  amountInputContainer: {
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
    color: '#10b981',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10b981',
    gap: 8,
  },
  editButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
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
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
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
