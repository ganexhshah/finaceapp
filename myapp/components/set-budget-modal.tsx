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
import { getBudgetRange, type BudgetPeriod } from '@/lib/dates';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type Category = { id: string; name: string; icon?: string; type: 'income' | 'expense'; color?: string };

export default function SetBudgetModal({ visible, onClose, onSaved }: SetBudgetModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [period, setPeriod] = useState('Monthly');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as any });

  React.useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      setLoadingCategories(true);
      try {
        const res = await api.getCategories('expense');
        if (!mounted) return;
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data as any);
          // Auto-select first category if none selected
          if (!selectedCategoryId && (res.data as any).length > 0) {
            setSelectedCategoryId((res.data as any)[0].id);
          }
        } else {
          console.error('Failed to load categories:', res.message);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const handlePeriodSelect = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setShowPeriodPicker(false);
  };

  const periodToApi = (label: string): BudgetPeriod => {
    switch (label.toLowerCase()) {
      case 'daily':
        return 'daily';
      case 'weekly':
        return 'weekly';
      case 'yearly':
        return 'yearly';
      case 'monthly':
      default:
        return 'monthly';
    }
  };

  const handleSave = async () => {
    const amt = Number(amount);
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

    const apiPeriod = periodToApi(period);
    const { startDate, endDate } = getBudgetRange(apiPeriod);

    setSaving(true);
    try {
      const res = await api.createBudget({
        categoryId: selectedCategoryId,
        amount: amt,
        period: apiPeriod,
        startDate,
        endDate,
      });

      if (!res.success) {
        setAlertConfig({ title: 'Failed', message: res.message || 'Failed to set budget', type: 'error' });
        setShowAlert(true);
        setSaving(false);
        return;
      }

      // Success! Show success message
      setAlertConfig({ title: 'Success', message: 'Budget set successfully!', type: 'success' });
      setShowAlert(true);
      
      // Reset form
      setAmount('');
      setSelectedCategoryId(null);
      
      // Wait a bit for user to see the success message, then close and refresh
      setTimeout(() => {
        setShowAlert(false);
        onSaved?.();
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Budget creation error:', e);
      setAlertConfig({ title: 'Error', message: 'Something went wrong while saving the budget', type: 'error' });
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
            <Text style={styles.headerTitle}>Set Budget</Text>
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
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {loadingCategories && categories.length === 0 ? (
                  <View style={{ paddingVertical: 12 }}>
                    <ActivityIndicator color="#f59e0b" />
                  </View>
                ) : categories.map((category) => {
                  const color = category.color || '#f59e0b';
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategoryId === category.id && styles.categoryItemActive,
                        { borderColor: selectedCategoryId === category.id ? color : '#e5e7eb' }
                      ]}
                      onPress={() => setSelectedCategoryId(category.id)}
                    >
                      <View style={[
                        styles.categoryIconContainer,
                        { backgroundColor: `${color}20` }
                      ]}>
                        <Ionicons
                          name={(category.icon || 'pricetag') as any}
                          size={20}
                          color={color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategoryId === category.id && { color }
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Period</Text>
              <TouchableOpacity 
                style={styles.periodButton}
                onPress={() => setShowPeriodPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.periodText}>{period}</Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Set a budget limit for this category. You'll receive notifications when you're close to the limit.
              </Text>
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
                <Text style={styles.saveButtonText}>Set Budget</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showPeriodPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPeriodPicker(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodPicker(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Period</Text>
              <TouchableOpacity onPress={() => setShowPeriodPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.periodList}>
              {periods.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.periodOption,
                    period === option && styles.periodOptionActive
                  ]}
                  onPress={() => handlePeriodSelect(option)}
                >
                  <Text style={[
                    styles.periodOptionText,
                    period === option && styles.periodOptionTextActive
                  ]}>
                    {option}
                  </Text>
                  {period === option && (
                    <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
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
    color: '#f59e0b',
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f59e0b',
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
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  categoryItemActive: {
    backgroundColor: '#ffffff',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  periodButton: {
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
  periodText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
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
    backgroundColor: '#f59e0b',
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
  periodList: {
    padding: 12,
  },
  periodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  periodOptionActive: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  periodOptionText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.select({ web: 'Google Sans, sans-serif', default: 'System' }),
  },
  periodOptionTextActive: {
    color: '#f59e0b',
    fontWeight: '700',
  },
});
